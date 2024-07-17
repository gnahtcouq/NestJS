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
    const { unionist, monthYear, fee } = createFeeDto;

    const isExist = await this.feeModel.findOne({ monthYear });
    if (isExist) {
      throw new BadRequestException(`Lệ phí ${monthYear} đã tồn tại`);
    }

    const newFee = await this.feeModel.create({
      unionist,
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

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    });

    // Filter out empty rows
    const filteredData = data.filter((row: Array<any>) =>
      row.some((cell: any) => cell !== null && cell !== ''),
    );

    // Process filtered data
    const processedData = filteredData.slice(1).map((row) => ({
      unionist: {
        _id: row[0],
        name: row[1],
      },
      monthYear: row[2],
      fee: row[3],
    }));

    // Save data to the database
    for (const record of processedData) {
      const { unionist, monthYear, fee } = record;

      // Check if the fee record already exists
      const isExist = await this.feeModel.findOne({
        monthYear,
        'unionist._id': unionist._id,
      });
      if (isExist) {
        throw new BadRequestException(
          `Lệ phí ${monthYear} cho công đoàn viên ${unionist.name} đã tồn tại`,
        );
      }

      await this.feeModel.create({
        unionist,
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
    }

    return { message: 'Tải file lên thành công' };
  }
}
