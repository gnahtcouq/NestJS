/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Unionist,
  UnionistDocument,
} from 'src/unionists/schemas/unionist.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class UnionistsService {
  constructor(
    @InjectModel(Unionist.name)
    private unionistModel: SoftDeleteModel<UnionistDocument>,
    private configService: ConfigService,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUnionistDto: CreateUnionistDto, @User() user: IUser) {
    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      address,
      CCCD,
      department,
      joiningDate,
      leavingDate,
      unionEntryDate,
      note,
    } = createUnionistDto;

    //logic check email exist
    const isExist = await this.unionistModel.findOne({ email });
    if (isExist)
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    const hashPassword = this.getHashPassword(password);

    let newUnionist = await this.unionistModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      CCCD,
      department,
      joiningDate,
      leavingDate,
      unionEntryDate,
      note,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUnionist;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.unionistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.unionistModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    return this.unionistModel
      .findOne({
        _id: id,
      })
      .select('-password') //không trả về password
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });
  }

  findOneByUserName(username: string) {
    return this.unionistModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async update(_id: string, updateUnionistDto: UpdateUnionistDto, user: IUser) {
    const updated = await this.unionistModel.updateOne(
      {
        _id: updateUnionistDto._id,
      },
      {
        ...updateUnionistDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `ID không hợp lệ`;

    const foundUser = await this.unionistModel.findById(id);
    if (
      foundUser &&
      foundUser.email === this.configService.get<string>('EMAIL_ADMIN')
    )
      throw new BadRequestException('Không thể xóa tài khoản Admin');

    await this.unionistModel.updateOne(
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

    return this.unionistModel.softDelete({
      _id: id,
    });
  }

  updateUnionistToken = async (refreshToken: string, _id: string) => {
    return await this.unionistModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };

  findUnionistByToken = async (refreshToken: string) => {
    return await this.unionistModel.findOne({
      refreshToken,
    });
  };

  async countUnionists() {
    return await this.unionistModel.countDocuments({ isDeleted: false });
  }
}
