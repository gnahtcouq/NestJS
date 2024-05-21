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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ResponseMessage('Tạo đơn vị')
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @User() user: IUser,
  ) {
    return this.departmentsService.create(createDepartmentDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách đơn vị')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.departmentsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin đơn vị')
  async findOne(@Param('id') id: string) {
    const foundDepartment = await this.departmentsService.findOne(id);
    return foundDepartment;
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn vị')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @User() user: IUser,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa đơn vị')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.departmentsService.remove(id, user);
  }
}
