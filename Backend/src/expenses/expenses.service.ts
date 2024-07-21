/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from 'src/expenses/schemas/expense.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';
import { parse, formatISO } from 'date-fns';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private expenseModel: SoftDeleteModel<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userM: IUser) {
    const { expenseId, description, time, amount, userId, expenseCategoryId } =
      createExpenseDto;

    const existingExpense = await this.expenseModel.findOne({ expenseId });

    if (existingExpense) {
      throw new BadRequestException(`Mã phiếu chi ${expenseId} đã tồn tại`);
    }

    const newExpense = await this.expenseModel.create({
      expenseId,
      description,
      time,
      amount,
      userId,
      expenseCategoryId,
      createdBy: {
        _id: userM._id,
        email: userM.email,
      },
    });

    return {
      _id: newExpense?._id,
      createdAt: newExpense?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.expenseModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.expenseModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, //tổng số bản ghi
      },
      result, //kết quả query
    };
  }

  async findByMonthAndYear(month: number, year: number) {
    // Xác định ngày bắt đầu và ngày kết thúc của tháng và năm cần tìm kiếm
    const startDate = new Date(year, month - 1, 1); // month - 1 vì tháng trong JavaScript là từ 0 đến 11
    const endDate = new Date(
      year,
      month - 1,
      new Date(year, month, 0).getDate(),
      23,
      59,
      59,
      999,
    );

    const filter = {
      time: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    };

    return await this.expenseModel.find(filter);
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ');
    return await this.expenseModel.findById(id);
  }

  async update(_id: string, updateExpenseDto: UpdateExpenseDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const updated = await this.expenseModel.updateOne(
      { _id: updateExpenseDto._id },
      {
        ...updateExpenseDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.expenseModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.expenseModel.softDelete({
      _id: id,
    });
  }

  async uploadFile(file: Express.Multer.File, user: IUser) {
    // Kiểm tra xem file có tồn tại không
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để tải lên');
    }

    // Kiểm tra loại file
    const allowedTypes = [
      'application/vnd.ms-excel', // for .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // for .xlsx
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ cho phép nhập từ file Excel');
    }

    // Đọc dữ liệu từ file Excel
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    });

    const totalRowsRead = data.length - 1; // Trừ đi hàng đầu tiên là header

    const invalidRows = [];

    // Lọc bỏ các dòng rỗng và kiểm tra dữ liệu hợp lệ
    const filteredData = data.slice(1).filter((row, index) => {
      // Kiểm tra dòng có đủ các cột cần thiết không
      if ((row as any[]).length < 6) {
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      const expenseUserId = row[0];
      const expenseId = row[1];
      const expenseDescription = row[2];
      const expenseIncomeCategoryId = row[3];
      const expenseTime = row[4];
      const expenseAmount = row[5];
      if (
        !expenseUserId ||
        !expenseId ||
        !expenseDescription ||
        !expenseIncomeCategoryId ||
        !expenseTime ||
        isNaN(expenseAmount) ||
        expenseAmount < 0 ||
        expenseAmount >= 10000000000
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra mã phiếu chi
      const expenseIdRegex = /^PC\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
      if (!expenseIdRegex.test(expenseId)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra ngày tháng năm
      const dayMonthYearRegex =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dayMonthYearRegex.test(expenseTime)) {
        invalidRows.push(index + 2);
        return false;
      }

      const [day, month, year] = expenseTime.split('/').map(Number);
      const isValidDate = (
        day: number,
        month: number,
        year: number,
      ): boolean => {
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      };

      if (!isValidDate(day, month, year)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra expenseAmount có phải là số không âm
      if (isNaN(parseFloat(expenseAmount)) || parseFloat(expenseAmount) < 0) {
        invalidRows.push(index + 2);
        return false;
      }

      return true;
    });

    // Số dòng hợp lệ
    const validRowsCount = filteredData.length;

    if (filteredData.length === 0) {
      throw new BadRequestException('Không có dữ liệu hợp lệ trong file');
    } else if (invalidRows.length > 0) {
      throw new BadRequestException(
        `Dữ liệu không hợp lệ ở các dòng: ${invalidRows.join(', ')}`,
      );
    }

    // Lưu dữ liệu vào cơ sở dữ liệu
    for (const row of filteredData) {
      const expenseUserId = row[0];
      const expenseId = row[1];
      const expenseDescription = row[2];
      const expenseIncomeCategoryId = row[3];
      const expenseTime = row[4];
      const expenseAmount = row[5];

      const [day, month, year] = expenseTime.split('/');
      const parsedDate = parse(
        `${day}/${month}/${year}`,
        'dd/MM/yyyy',
        new Date(),
      );
      const formattedDate = formatISO(parsedDate);

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingUnionist = await this.expenseModel.findOne({
          expenseId: expenseId,
        });

        if (existingUnionist) {
          throw new BadRequestException(`Mã phiếu chi ${expenseId} đã tồn tại`);
        }

        // Tạo mới bản ghi phiếu chi
        await this.expenseModel.create({
          userId: expenseUserId,
          expenseId: expenseId,
          description: expenseDescription,
          expenseCategoryId: expenseIncomeCategoryId,
          time: formattedDate,
          amount: expenseAmount,
          createdBy: {
            _id: user._id,
            email: user.email,
          },
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        throw new BadRequestException(`Lỗi khi lưu dữ liệu: ${error.message}`);
      }
    }

    return {
      message: 'Tải file lên thành công',
      totalRowsRead,
      validRowsCount,
    };
  }
}
