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
import { isValidTypeDateRangeId } from 'src/util/utils';

@Injectable()
export class IncomeCategoriesService {
  constructor(
    @InjectModel(IncomeCategory.name)
    private incomeCategoryModel: SoftDeleteModel<IncomeCategoryDocument>,
  ) {}

  async create(createIncomeCategoryDto: CreateIncomeCategoryDto, user: IUser) {
    const { id, description, budget, year } = createIncomeCategoryDto;

    // Kiểm tra trùng lặp
    const existingCategory = await this.incomeCategoryModel.findOne({
      $or: [
        { description, year },
        { description, year, id },
        { id, year },
      ],
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Nội dung và năm hoặc mã danh mục thu đã tồn tại',
      );
    }

    const newIncomeCategory = await this.incomeCategoryModel.create({
      id,
      description,
      budget,
      year,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      history: [
        {
          description: `${description} (Đầu tiên)`,
          year: year,
          budget: budget,
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
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
    // if (!mongoose.Types.ObjectId.isValid(id))
    //   throw new BadRequestException('ID không hợp lệ');

    // Kiểm tra mã danh mục thu
    const idRegex = /^DMT\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/;
    if (!idRegex.test(id)) throw new BadRequestException('ID không hợp lệ');

    return await this.incomeCategoryModel.findOne({ id: id });
  }

  async update(
    _id: string,
    updateIncomeCategoryDto: UpdateIncomeCategoryDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const { description, year } = updateIncomeCategoryDto;

    // Kiểm tra trùng lặp
    const existingCategory = await this.incomeCategoryModel.findOne({
      $or: [{ description, year, _id: { $ne: _id } }],
    });

    if (existingCategory) {
      throw new BadRequestException(
        'Mô tả và năm hoặc mã danh mục thu đã tồn tại',
      );
    }

    const updated = await this.incomeCategoryModel.updateOne(
      { _id: updateIncomeCategoryDto._id },
      {
        $set: {
          ...updateIncomeCategoryDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
        $push: {
          history: {
            description: updateIncomeCategoryDto.description,
            year: updateIncomeCategoryDto.year,
            budget: updateIncomeCategoryDto.budget,
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

  async findIncomeCategoriesByTime(qs: string) {
    const { filter, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Kiểm tra xem query string có chứa year hay không
    if (filter.year) {
      const year = filter.year;
      delete filter.year; // Xóa year khỏi filter để tránh ảnh hưởng đến query khác
      filter.year = year.toString();
    }

    const totalItems = (await this.incomeCategoryModel.find(filter)).length;

    const result = await this.incomeCategoryModel
      .find(filter)
      .sort('-year')
      .populate(population)
      .select('budget')
      .exec();

    const totalBudget = await this.incomeCategoryModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$budget' } },
        },
      },
    ]);

    return {
      meta: {
        total: totalItems, // tổng số bản ghi
        totalBudget: totalBudget[0]?.total || 0, // tổng số tiền
      },
      result, // kết quả query
    };
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
      throw new BadRequestException('Không tìm thấy file để nhập dữ liệu');
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
    const existingIncomeCategory = [];

    // Lọc bỏ các dòng rỗng và kiểm tra dữ liệu hợp lệ
    const filteredData = data.slice(1).filter(async (row, index) => {
      // Kiểm tra dòng có đủ các cột cần thiết không
      if ((row as any[]).length < 4) {
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      const id = row[0];
      const incomeCategoryDescription = row[1];
      const parsedBudget = parseFloat(row[2]);
      const incomeCategoryYear = row[3];
      if (
        !id ||
        !incomeCategoryDescription ||
        !isNaN(parsedBudget) ||
        parsedBudget < 1000 ||
        parsedBudget >= 10000000000 ||
        !incomeCategoryYear
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra mã danh mục thu
      if (!isValidTypeDateRangeId(id, 'DMT', 'categoryyyyymmdd')) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra độ dài mô tả
      if (incomeCategoryDescription.length > 50) {
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
      if (year < 1970 || year > currentYear) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra xem bản ghi đã tồn tại chưa
      const res = await this.incomeCategoryModel.findOne({
        $or: [
          {
            description: incomeCategoryDescription,
            year: incomeCategoryYear,
          },
          { id, year: incomeCategoryYear },
        ],
      });
      if (res) existingIncomeCategory.push(index + 2);

      return true;
    });

    // Số dòng hợp lệ
    const validRowsCount = filteredData.length;

    if (filteredData.length === 0 || invalidRows.length > 0) {
      throw new BadRequestException(
        'Dữ liệu không hợp lệ. Xin hãy kiểm tra lại quy tắc nhập liệu',
      );
    }

    // Lưu dữ liệu vào cơ sở dữ liệu
    for (const row of filteredData) {
      const id = row[0];
      const incomeCategoryDescription = row[1];
      const incomeCategoryBudget = parseFloat(row[2]);
      const incomeCategoryYear = row[3];

      if (existingIncomeCategory.length > 0) {
        try {
          // Tạo mới bản ghi phiếu thu
          await this.incomeCategoryModel.create({
            id: id,
            description: incomeCategoryDescription,
            budget: incomeCategoryBudget,
            year: incomeCategoryYear,
            createdBy: {
              _id: user._id,
              email: user.email,
            },
            history: [
              {
                description: `${incomeCategoryDescription} (Đầu tiên)`,
                budget: incomeCategoryBudget,
                year: incomeCategoryYear,
                updatedAt: new Date(),
                updatedBy: {
                  _id: user._id,
                  email: user.email,
                },
              },
            ],
          });
        } catch (error) {
          throw new BadRequestException(
            `Lỗi khi lưu dữ liệu: ${error.message}`,
          );
        }
      } else {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Xin hãy kiểm tra lại',
        );
      }
    }

    return {
      message: 'Nhập dữ liệu từ file excel thành công',
      totalRowsRead,
      validRowsCount,
    };
  }
}
