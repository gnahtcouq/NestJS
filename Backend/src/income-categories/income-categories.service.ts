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
}
