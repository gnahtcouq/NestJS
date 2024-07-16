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

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt.name)
    private receiptModel: SoftDeleteModel<ReceiptDocument>,
  ) {}

  async create(createReceiptDto: CreateReceiptDto, userM: IUser) {
    const { user, description, time, amount, incomeCategory } =
      createReceiptDto;

    const newReceipt = await this.receiptModel.create({
      user,
      description,
      time,
      amount,
      incomeCategory,
      createdBy: {
        _id: userM._id,
        email: userM.email,
      },
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ');
    return await this.receiptModel.findById(id);
  }

  async update(_id: string, updateReceiptDto: UpdateReceiptDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ');

    const updated = await this.receiptModel.updateOne(
      { _id: updateReceiptDto._id },
      {
        ...updateReceiptDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
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
}
