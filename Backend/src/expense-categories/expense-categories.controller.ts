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
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Post()
  @ResponseMessage('Tạo mới danh mục chi')
  create(
    @Body() createExpenseCategoryDto: CreateExpenseCategoryDto,
    @User() user: IUser,
  ) {
    return this.expenseCategoriesService.create(createExpenseCategoryDto, user);
  }

  @Get()
  @ResponseMessage('Danh sách danh mục chi')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.expenseCategoriesService.findAll(+currentPage, +limit, qs);
  }

  @Get('by-time')
  @ResponseMessage('Lấy thông tin danh mục chi theo thời gian')
  findExpenseCategoriesByTime(@Query() qs: string) {
    return this.expenseCategoriesService.findExpenseCategoriesByTime(qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin danh mục chi')
  findOne(@Param('id') id: string) {
    return this.expenseCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật danh mục chi')
  update(
    @Param('id') id: string,
    @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto,
    @User() user: IUser,
  ) {
    return this.expenseCategoriesService.update(
      id,
      updateExpenseCategoryDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Xóa danh mục chi')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.expenseCategoriesService.remove(id, user);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Tải lên danh mục chi')
  async upload(@UploadedFile() file: Express.Multer.File, @User() user: IUser) {
    return this.expenseCategoriesService.uploadFile(file, user);
  }
}
