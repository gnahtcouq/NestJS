/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: SoftDeleteModel<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, user: IUser) {
    const {
      name,
      threads,
      description,
      // startDate,
      // endDate,
    } = createPostDto;

    let newPost = await this.postModel.create({
      name,
      threads,
      // department,
      description,
      // startDate,
      // endDate,
      status: 'INACTIVE',
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newPost;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.postModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.postModel
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
        total: totalItems, //tổng số bản ghi
      },
      result, //kết quả query
    };
  }

  async findPostWithTime(currentPage: number, limit: number, qs: string) {
    const { filter, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let dateFilter = {};

    if (filter.createdAt) {
      try {
        // Parse the date string and create a start and end date for the filter
        const date = new Date(filter.createdAt);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        const start = new Date(date.setUTCHours(0, 0, 0, 0));
        const end = new Date(date.setUTCHours(23, 59, 59, 999));
        dateFilter = { $gte: start, $lte: end };
      } catch (error) {
        throw new Error('Invalid date format');
      }
      delete filter.createdAt;
    }

    if (Object.keys(dateFilter).length) {
      filter.createdAt = dateFilter;
    }

    const offset = (currentPage - 1) * limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.postModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.postModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort('-createdAt')
      .populate(population)
      .select('-history')
      .exec();

    const totalAmount = await this.postModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } },
        },
      },
    ]);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
        totalAmount: totalAmount[0]?.total || 0,
      },
      result,
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    return this.postModel.findById({
      _id: id,
    });
  }

  async update(_id: string, updatePostDto: UpdatePostDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ!');

    const currentStatus = await this.postModel.findOne({ _id });

    if (currentStatus.status === 'ACTIVE')
      throw new BadRequestException(
        'Trạng thái bài đăng đang hoạt động, không thể chỉnh sửa. Hãy liên hệ với quản trị viên của bạn',
      );

    const updated = await this.postModel.updateOne(
      {
        _id,
      },
      {
        ...updatePostDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async updateStatus(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('ID không hợp lệ!');
    }
    const updated = await this.postModel.updateOne(
      { _id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    await this.postModel.updateOne(
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

    return this.postModel.softDelete({
      _id: id,
    });
  }

  async countPosts() {
    return await this.postModel.countDocuments({ isDeleted: false });
  }
}
