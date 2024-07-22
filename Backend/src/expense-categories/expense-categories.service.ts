/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  ExpenseCategory,
  ExpenseCategoryDocument,
} from 'src/expense-categories/schemas/expense-category.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectModel(ExpenseCategory.name)
    private expenseCategoryModel: SoftDeleteModel<ExpenseCategoryDocument>,
  ) {}

  async create(
    createExpenseCategoryDto: CreateExpenseCategoryDto,
    user: IUser,
  ) {
    const { expenseCategoryId, description, budget, year } =
      createExpenseCategoryDto;

    // Kiểm tra trùng lặp
    const existingCategory = await this.expenseCategoryModel.findOne({
      $or: [
        { description, year },
        { description, year, expenseCategoryId },
        { expenseCategoryId, year },
      ],
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Nội dung và năm hoặc mã danh mục chi đã tồn tại',
      );
    }

    const newExpenseCategory = await this.expenseCategoryModel.create({
      expenseCategoryId,
      description,
      budget,
      year,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newExpenseCategory?._id,
      createdAt: newExpenseCategory?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.expenseCategoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.expenseCategoryModel
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

  async findOne(id: string) {
    // if (!mongoose.Types.ObjectId.isValid(id))
    //   throw new BadRequestException('ID không hợp lệ');

    // Kiểm tra mã danh mục chi
    const expenseCategoryIdRegex =
      /^DMC\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
    if (!expenseCategoryIdRegex.test(id))
      throw new BadRequestException('ID không hợp lệ');

    return await this.expenseCategoryModel.findOne({ expenseCategoryId: id });
  }

  async update(
    _id: string,
    updateExpenseCategoryDto: UpdateExpenseCategoryDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const { expenseCategoryId, description, year, budget } =
      updateExpenseCategoryDto;

    if (expenseCategoryId !== undefined) {
      throw new BadRequestException('Không thể cập nhật mã danh mục chi');
    }

    // Kiểm tra budget
    const parsedBudget = parseFloat(budget);
    if (
      isNaN(parsedBudget) ||
      parsedBudget < 1000 ||
      parsedBudget >= 10000000000
    )
      throw new BadRequestException(
        'Dự toán không hợp lệ (Hợp lệ từ 1000đ -> 10 tỷ)',
      );

    // Kiểm tra trùng lặp
    const existingCategory = await this.expenseCategoryModel.findOne({
      $or: [
        { description, year, _id: { $ne: _id } },
        { description, year, expenseCategoryId, _id: { $ne: _id } },
      ],
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Mô tả và năm hoặc mã danh mục chi đã tồn tại',
      );
    }

    const updated = await this.expenseCategoryModel.updateOne(
      { _id: updateExpenseCategoryDto._id },
      {
        ...updateExpenseCategoryDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.expenseCategoryModel.updateOne(
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

    return this.expenseCategoryModel.softDelete({
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
      if ((row as any[]).length < 4) {
        return false;
      }
      // Kiểm tra các giá trị cột có hợp lệ không
      const expenseCategoryId = row[0];
      const expenseCategoryDescription = row[1];
      const parsedBudget = parseFloat(row[2]);
      const expenseCategoryYear = row[3];
      if (
        !expenseCategoryId ||
        !expenseCategoryDescription ||
        isNaN(parsedBudget) ||
        parsedBudget < 1000 ||
        parsedBudget >= 10000000000 ||
        !expenseCategoryYear
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra mã danh mục chi
      const expenseCategoryIdRegex =
        /^DMC\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
      if (!expenseCategoryIdRegex.test(expenseCategoryId)) {
        invalidRows.push(index + 2);
        return false;
      }

      const yearRegex = /^\d{4}$/;

      if (!yearRegex.test(expenseCategoryYear)) {
        invalidRows.push(index + 2);
        return false;
      }

      const year = Number(expenseCategoryYear);

      // Kiểm tra năm hợp lệ
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
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
      const expenseCategoryId = row[0];
      const expenseCategoryDescription = row[1];
      const expenseCategoryBudget = row[2];
      const expenseCategoryYear = row[3];

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingCategory = await this.expenseCategoryModel.findOne({
          $or: [
            {
              description: expenseCategoryDescription,
              year: expenseCategoryYear,
            },
            { expenseCategoryId, year: expenseCategoryYear },
          ],
        });

        if (existingCategory) {
          throw new BadRequestException(
            `Nội dung  ${expenseCategoryDescription} và năm ${expenseCategoryYear} hoặc mã danh mục chi (${expenseCategoryYear}) đã tồn tại`,
          );
        }

        // Tạo mới bản ghi phiếu thu
        await this.expenseCategoryModel.create({
          expenseCategoryId: expenseCategoryId,
          description: expenseCategoryDescription,
          budget: expenseCategoryBudget,
          year: expenseCategoryYear,
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
