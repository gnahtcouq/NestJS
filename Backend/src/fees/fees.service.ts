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
}
