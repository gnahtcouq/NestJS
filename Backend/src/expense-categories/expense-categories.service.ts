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
    const { description, budget, year } = createExpenseCategoryDto;

    const newExpenseCategory = await this.expenseCategoryModel.create({
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ');
    return await this.expenseCategoryModel.findById(id);
  }

  async update(
    _id: string,
    updateExpenseCategoryDto: UpdateExpenseCategoryDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

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
}
