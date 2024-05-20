/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { CreateDepartmentsDto } from './dto/create-department.dto';
import { UpdateDepartmentsDto } from './dto/update-department.dto';
import {
  Departments,
  DepartmentsDocument,
} from 'src/departments/schemas/department.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Departments.name)
    private departmentsModel: SoftDeleteModel<DepartmentsDocument>,
  ) {}

  create(createDepartmentsDto: CreateDepartmentsDto, user: IUser) {
    return this.departmentsModel.create({
      ...createDepartmentsDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.departmentsModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.departmentsModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `ID không hợp lệ`;

    return this.departmentsModel.findById({
      _id: id,
    });
  }

  async update(
    id: string,
    updateDepartmentsDto: UpdateDepartmentsDto,
    user: IUser,
  ) {
    return await this.departmentsModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateDepartmentsDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.departmentsModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.departmentsModel.softDelete({
      _id: id,
    });
  }
}
