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
import { FeesService } from './fees.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post()
  @ResponseMessage('Tạo mới công đoàn phí')
  create(@Body() createFeeDto: CreateFeeDto, @User() user: IUser) {
    return this.feesService.create(createFeeDto, user);
  }

  @Get()
  @ResponseMessage('Danh sách công đoàn phí')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.feesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin công đoàn phí')
  findOne(@Param('id') id: string) {
    return this.feesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật công đoàn phí')
  update(
    @Param('id') id: string,
    @Body() updateFeeDto: UpdateFeeDto,
    @User() user: IUser,
  ) {
    return this.feesService.update(id, updateFeeDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa công đoàn phí')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.feesService.remove(id, user);
  }
}
