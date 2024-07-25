/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  Department,
  DepartmentDocument,
} from 'src/departments/schemas/department.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: SoftDeleteModel<DepartmentDocument>,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto, user: IUser) {
    return this.departmentModel.create({
      ...createDepartmentDto,
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
    const totalItems = (await this.departmentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.departmentModel
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
        total: totalItems, //tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findAllWithoutDescription(
    currentPage: number,
    limit: number,
    qs: string,
  ) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.departmentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.departmentModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('id name')
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, //tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Không tìm thấy đơn vị với ID là ${id}`);

    return await this.departmentModel.findById({
      _id: id,
    });
  }

  async findDepartmentNameWithDepartmentId(id: string) {
    const departmentIdRegex = /^DV\d{2}$/;
    if (!departmentIdRegex.test(id))
      throw new BadRequestException('ID không hợp lệ!');

    const department = await this.departmentModel
      .findOne({
        id,
      })
      .select('name'); //trả về name

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    user: IUser,
  ) {
    return await this.departmentModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateDepartmentDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.departmentModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.departmentModel.softDelete({
      _id: id,
    });
  }

  async countDepartments() {
    return await this.departmentModel.countDocuments({ isDeleted: false });
  }
}
