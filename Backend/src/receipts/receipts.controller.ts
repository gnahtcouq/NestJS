/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @ResponseMessage('Tạo mới phiếu thu')
  create(@Body() createReceiptDto: CreateReceiptDto, @User() user: IUser) {
    return this.receiptsService.create(createReceiptDto, user);
  }

  @Get()
  @ResponseMessage('Danh sách phiếu thu')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.receiptsService.findAll(+currentPage, +limit, qs);
  }

  @Get('by-month-year')
  @ResponseMessage('Lấy danh sách phiếu thu theo tháng và năm')
  async findByMonthAndYear(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.receiptsService.findByMonthAndYear(month, year);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin phiếu thu')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật phiếu thu')
  update(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @User() user: IUser,
  ) {
    return this.receiptsService.update(id, updateReceiptDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa phiếu thu')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.receiptsService.remove(id, user);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Tải lên danh sách phiếu thu')
  async upload(@UploadedFile() file: Express.Multer.File, @User() user: IUser) {
    return this.receiptsService.uploadFile(file, user);
  }
}
