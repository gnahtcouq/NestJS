/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  IncomeCategory,
  IncomeCategoryDocument,
} from 'src/income-categories/schemas/income-category.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';

@Injectable()
export class IncomeCategoriesService {
  constructor(
    @InjectModel(IncomeCategory.name)
    private incomeCategoryModel: SoftDeleteModel<IncomeCategoryDocument>,
  ) {}

  async create(createIncomeCategoryDto: CreateIncomeCategoryDto, user: IUser) {
    const { description, budget, year } = createIncomeCategoryDto;

    const newIncomeCategory = await this.incomeCategoryModel.create({
      description,
      budget,
      year,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newIncomeCategory?._id,
      createdAt: newIncomeCategory?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.incomeCategoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.incomeCategoryModel
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
    return await this.incomeCategoryModel.findById(id);
  }

  async update(
    _id: string,
    updateIncomeCategoryDto: UpdateIncomeCategoryDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const updated = await this.incomeCategoryModel.updateOne(
      { _id: updateIncomeCategoryDto._id },
      {
        ...updateIncomeCategoryDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.incomeCategoryModel.updateOne(
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

    return this.incomeCategoryModel.softDelete({
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
      if ((row as any[]).length < 3) {
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      const incomeCategoryDescription = row[0];
      const incomeCategoryBudget = row[1];
      const incomeCategoryYear = row[2];
      if (
        !incomeCategoryDescription ||
        !incomeCategoryBudget ||
        !incomeCategoryYear
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      const yearRegex = /^\d{4}$/;

      if (!yearRegex.test(incomeCategoryYear)) {
        invalidRows.push(index + 2);
        return false;
      }

      const year = Number(incomeCategoryYear);

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
      const incomeCategoryDescription = row[0];
      const incomeCategoryBudget = row[1];
      const incomeCategoryYear = row[2];

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingUnionist = await this.incomeCategoryModel.findOne({
          description: incomeCategoryDescription,
          year: incomeCategoryYear,
        });

        if (existingUnionist) {
          throw new BadRequestException(
            `${incomeCategoryDescription} (${incomeCategoryYear}) đã tồn tại`,
          );
        }

        // Tạo mới bản ghi phiếu thu
        await this.incomeCategoryModel.create({
          description: incomeCategoryDescription,
          budget: incomeCategoryBudget,
          year: incomeCategoryYear,
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
