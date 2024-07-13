/* eslint-disable prefer-const */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';

@Controller('users') // => /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Tạo thành viên')
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Lấy danh sách thành viên')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string, // query string
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage('Lấy thông tin thành viên')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin thành viên')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    let updatedUser = await this.usersService.update(id, updateUserDto, user);
    return updatedUser;
  }

  @Delete(':id')
  @ResponseMessage('Xóa thành viên')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Post('count')
  @ResponseMessage('Lấy số lượng thành viên')
  countUsers() {
    return this.usersService.countUsers();
  }

  @Post('request-change-email/:id')
  @ResponseMessage('Gửi yêu cầu thay đổi email')
  async requestChangeEmail(
    @Param('id') id: string,
    @Body('newEmail') newEmail: string,
    @User() user: IUser,
  ) {
    const result = await this.usersService.requestChangeEmail(
      id,
      newEmail,
      user,
    );
    return { success: result };
  }

  @Post('confirm-change-email/:id')
  @ResponseMessage('Xác nhận thay đổi email')
  async confirmChangeEmail(
    @Param('id') id: string,
    @Body('verificationCode') verificationCode: string,
    @Body('newEmail') newEmail: string,
  ) {
    const result = await this.usersService.confirmChangeEmail(
      id,
      verificationCode,
      newEmail,
    );
    return { email: result };
  }

  @Post('change-password/:id')
  @ResponseMessage('Thay đổi mật khẩu')
  async requestPasswordChange(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.usersService.changePassword(
      id,
      changePasswordDto,
    );
    return { success: result };
  }
}
