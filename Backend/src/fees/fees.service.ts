/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Fee, FeeDocument } from 'src/fees/schemas/fee.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';

@Injectable()
export class FeesService {
  constructor(
    @InjectModel(Fee.name)
    private feeModel: SoftDeleteModel<FeeDocument>,
  ) {}

  async create(createFeeDto: CreateFeeDto, user: IUser) {
    const { unionistId, monthYear, fee } = createFeeDto;

    const isExist = await this.feeModel.findOne({ unionistId, monthYear });
    if (isExist) {
      throw new BadRequestException(
        `Lệ phí ${monthYear} cho công đoàn viên ${unionistId} đã tồn tại`,
      );
    }

    const newFee = await this.feeModel.create({
      unionistId,
      monthYear,
      fee,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newFee?._id,
      createdAt: newFee?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.feeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.feeModel
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ');
    return await this.feeModel.findById(id);
  }

  async update(_id: string, updateFeeDto: UpdateFeeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const { unionistId, monthYear, fee } = updateFeeDto;

    if (unionistId !== undefined) {
      throw new BadRequestException(
        'Không thể cập nhật công đoàn viên đóng phí',
      );
    }

    // Kiểm tra monthYear theo định dạng yyyy/mm
    const yearMonthRegex = /^\d{4}\/(0[1-9]|1[0-2])$/;
    if (!yearMonthRegex.test(monthYear)) {
      throw new BadRequestException('Tháng/năm không hợp lệ');
    }

    // Kiểm tra amount
    const parsedFee = parseFloat(fee);
    if (isNaN(parsedFee) || parsedFee < 1000 || parsedFee >= 10000000000)
      throw new BadRequestException(
        'Số tiền không hợp lệ (Hợp lệ từ 1000đ -> 10 tỷ)',
      );

    const updated = await this.feeModel.updateOne(
      { _id: updateFeeDto._id },
      {
        ...updateFeeDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.feeModel.updateOne(
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

    return this.feeModel.softDelete({
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
      const unionistId = row[0];
      const unionistName = row[1];
      const monthYear = row[2];
      const parseFee = parseFloat(row[3]);

      if (
        !unionistId ||
        !unionistName ||
        !monthYear ||
        isNaN(parseFee) ||
        parseFee < 1000 ||
        parseFee >= 10000000000
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra monthYear theo định dạng yyyy/mm
      const yearMonthRegex = /^\d{4}\/(0[1-9]|1[0-2])$/;
      if (!yearMonthRegex.test(monthYear)) {
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
      const unionistId = row[0];
      const unionistName = row[1];
      const monthYear = row[2];
      const fee = parseFloat(row[3]);

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingFee = await this.feeModel.findOne({
          unionistId,
          monthYear,
        });

        if (existingFee) {
          throw new BadRequestException(
            `Lệ phí ${monthYear} cho công đoàn viên ${unionistName} đã tồn tại`,
          );
        }

        // Tạo mới bản ghi lệ phí
        await this.feeModel.create({
          unionist: {
            _id: unionistId,
            name: unionistName,
          },
          monthYear,
          fee,
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
