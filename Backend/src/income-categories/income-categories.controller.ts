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
import { IncomeCategoriesService } from './income-categories.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('income-categories')
export class IncomeCategoriesController {
  constructor(
    private readonly incomeCategoriesService: IncomeCategoriesService,
  ) {}

  @Post()
  @ResponseMessage('Tạo mới danh mục thu')
  create(
    @Body() createIncomeCategoryDto: CreateIncomeCategoryDto,
    @User() user: IUser,
  ) {
    return this.incomeCategoriesService.create(createIncomeCategoryDto, user);
  }

  @Get()
  @ResponseMessage('Danh sách danh mục thu')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.incomeCategoriesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin danh mục thu')
  findOne(@Param('id') id: string) {
    return this.incomeCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật danh mục thu')
  update(
    @Param('id') id: string,
    @Body() updateIncomeCategoryDto: UpdateIncomeCategoryDto,
    @User() user: IUser,
  ) {
    return this.incomeCategoriesService.update(
      id,
      updateIncomeCategoryDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Xóa danh mục thu')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.incomeCategoriesService.remove(id, user);
  }
}
