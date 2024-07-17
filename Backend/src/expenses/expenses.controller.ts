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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ResponseMessage('Tạo mới phiếu chi')
  create(@Body() createExpenseDto: CreateExpenseDto, @User() user: IUser) {
    return this.expensesService.create(createExpenseDto, user);
  }

  @Get()
  @ResponseMessage('Danh sách phiếu chi')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.expensesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin phiếu chi')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật phiếu chi')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user: IUser,
  ) {
    return this.expensesService.update(id, updateExpenseDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa phiếu chi')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.expensesService.remove(id, user);
  }
}
