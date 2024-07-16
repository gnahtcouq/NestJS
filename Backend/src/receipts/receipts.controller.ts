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
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

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
}
