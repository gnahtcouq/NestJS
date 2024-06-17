/* eslint-disable prefer-const */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';

@Controller('unionists')
export class UnionistsController {
  constructor(private readonly unionistsService: UnionistsService) {}

  @Post()
  @ResponseMessage('Tạo công đoàn viên')
  async create(
    @Body() createUnionistDto: CreateUnionistDto,
    @User() user: IUser,
  ) {
    let newUnionist = await this.unionistsService.create(
      createUnionistDto,
      user,
    );
    return {
      _id: newUnionist?._id,
      createdAt: newUnionist?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Lấy danh sách công đoàn viên')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string, // query string
  ) {
    return this.unionistsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Lấy thông tin công đoàn viên')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const foundUnionist = await this.unionistsService.findOne(id);
    return foundUnionist;
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật công đoàn viên')
  async update(
    @Param('id') id: string,
    @Body() updateUnionistDto: UpdateUnionistDto,
    @User() user: IUser,
  ) {
    let updatedUnionist = await this.unionistsService.update(
      id,
      updateUnionistDto,
      user,
    );
    return updatedUnionist;
  }

  @Delete(':id')
  @ResponseMessage('Xóa công đoàn viên')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.unionistsService.remove(id, user);
  }

  @Post('count')
  @ResponseMessage('Lấy số lượng công đoàn viên')
  countUnionists() {
    return this.unionistsService.countUnionists();
  }
}
