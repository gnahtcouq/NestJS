/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { Receipt, ReceiptDocument } from 'src/receipts/schemas/receipt.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';
import { parse, formatISO } from 'date-fns';
import { isValidateDate } from 'src/util/utils';
import dayjs from 'dayjs';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt.name)
    private receiptModel: SoftDeleteModel<ReceiptDocument>,
  ) {}

  async create(createReceiptDto: CreateReceiptDto, userM: IUser) {
    const { userId, id, description, time, amount, incomeCategoryId } =
      createReceiptDto;

    const existingReceipt = await this.receiptModel.findOne({ id });

    if (existingReceipt) {
      throw new BadRequestException(`Mã phiếu thu ${id} đã tồn tại`);
    }

    if (!isValidateDate(time))
      throw new BadRequestException('Thời gian thu không hợp lệ');

    const newReceipt = await this.receiptModel.create({
      userId,
      id,
      description,
      time,
      amount,
      incomeCategoryId,
      createdBy: {
        _id: userM._id,
        email: userM.email,
      },
      history: [
        {
          description: `${description} (Đầu tiên)`,
          time: time,
          amount: amount,
          updatedAt: new Date(),
          updatedBy: {
            _id: userM._id,
            email: userM.email,
          },
        },
      ],
    });

    return {
      _id: newReceipt?._id,
      createdAt: newReceipt?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.receiptModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.receiptModel
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

    return await this.receiptModel.find(filter);
  }

  async findOne(id: string) {
    // if (!mongoose.Types.ObjectId.isValid(id))
    //   throw new BadRequestException('ID không hợp lệ');

    // Kiểm tra mã phiếu thu
    const idRegex = /^PT\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
    if (!idRegex.test(id)) throw new BadRequestException('ID không hợp lệ');

    return await this.receiptModel.findOne({ id: id });
  }

  async update(_id: string, updateReceiptDto: UpdateReceiptDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const { id, amount, time } = updateReceiptDto;

    if (id !== undefined) {
      throw new BadRequestException('Không thể cập nhật mã phiếu thu');
    }

    // Kiểm tra amount
    const parsedAmount = parseFloat(amount);
    if (
      isNaN(parsedAmount) ||
      parsedAmount < 1000 ||
      parsedAmount >= 10000000000
    )
      throw new BadRequestException(
        'Số tiền không hợp lệ (Hợp lệ từ 1000đ -> 10 tỷ)',
      );

    if (!isValidateDate(time))
      throw new BadRequestException('Thời gian thu không hợp lệ');

    const updated = await this.receiptModel.updateOne(
      { _id: updateReceiptDto._id },
      {
        $set: {
          ...updateReceiptDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
        $push: {
          history: {
            description: updateReceiptDto.description,
            time: updateReceiptDto.time,
            amount: updateReceiptDto.amount,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.receiptModel.updateOne(
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

    return this.receiptModel.softDelete({
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
    let data = xlsx.utils.sheet_to_json(worksheet, {
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
      const receiptUserId = row[0];
      const id = row[1];
      const receiptDescription = row[2];
      const receiptIncomeCategoryId = row[3];
      const receiptTime = row[4];
      const parsedAmount = parseFloat(row[5]);

      if (
        !receiptUserId ||
        !id ||
        !receiptDescription ||
        !receiptIncomeCategoryId ||
        !receiptTime ||
        isNaN(parsedAmount) ||
        parsedAmount < 1000 ||
        parsedAmount >= 10000000000
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra mã phiếu thu
      const idRegex = /^PT\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
      if (!idRegex.test(id)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra ngày tháng năm
      const dayMonthYearRegex =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dayMonthYearRegex.test(receiptTime)) {
        invalidRows.push(index + 2);
        return false;
      }

      const [day, month, year] = receiptTime.split('/').map(Number);
      // Kiểm tra năm không nhỏ hơn 1900
      if (year < 1900) {
        invalidRows.push(index + 2);
        return false;
      }

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

      // Kiểm tra ngày không nằm sau ngày hiện tại
      if (dayjs(new Date(year, month - 1, day)).isAfter(dayjs())) {
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
      const receiptUserId = row[0];
      const id = row[1];
      const receiptDescription = row[2];
      const receiptIncomeCategoryId = row[3];
      const receiptTime = row[4];
      const receiptAmount = parseFloat(row[5]);

      const [day, month, year] = receiptTime.split('/');
      const parsedDate = parse(
        `${day}/${month}/${year}`,
        'dd/MM/yyyy',
        new Date(),
      );
      // Thêm giờ phút giây hiện tại vào ngày
      const currentDateTime = new Date();
      parsedDate.setHours(currentDateTime.getHours());
      parsedDate.setMinutes(currentDateTime.getMinutes());
      parsedDate.setSeconds(currentDateTime.getSeconds());
      parsedDate.setMilliseconds(currentDateTime.getMilliseconds());
      const formattedDate = formatISO(parsedDate);

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingReceipt = await this.receiptModel.findOne({
          id: id,
        });

        if (existingReceipt) {
          throw new BadRequestException(`Mã phiếu thu ${id} đã tồn tại`);
        }

        // Tạo mới bản ghi phiếu thu
        await this.receiptModel.create({
          userId: receiptUserId,
          id: id,
          description: receiptDescription,
          incomeCategoryId: receiptIncomeCategoryId,
          time: formattedDate,
          amount: receiptAmount,
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
