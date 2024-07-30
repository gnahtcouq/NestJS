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
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { UpdateUserPermissionsDto } from 'src/users/dto/update-user-permissions';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Get(':id')
  @ResponseMessage('Lấy thông tin thành viên')
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  @Public()
  @Get('name/:id')
  @ResponseMessage('Lấy tên thành viên theo mã thành viên')
  async findUserNameWithUserId(@Param('id') id: string) {
    const foundUser = await this.usersService.findUserNameWithUserId(id);
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

  @Put(':id')
  @ResponseMessage('Cập nhật quyền hạn thành viên')
  updateUserPermissions(
    @Param('id') id: string,
    @Body() updateUserPermissionsDto: UpdateUserPermissionsDto,
    @User() user: IUser,
  ) {
    return this.usersService.updateUserPermissions(
      id,
      updateUserPermissionsDto,
      user,
    );
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

  @Public()
  @Post('request-forgot-password')
  @ResponseMessage('Gửi yêu cầu đặt lại mật khẩu')
  async requestForgotPassword(@Body('email') email: string) {
    const result = await this.usersService.requestForgotPassword(email);
    return { success: result };
  }

  @Public()
  @Post('confirm-forgot-password/:id')
  @ResponseMessage('Xác nhận đặt lại mật khẩu')
  async confirmForgotPassword(
    @Param('id') id: string,
    @Body('verificationCodePassword') verificationCodePassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.usersService.confirmForgotPassword(
      id,
      verificationCodePassword,
      newPassword,
    );
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Tải lên danh sách thành viên')
  async upload(@UploadedFile() file: Express.Multer.File, @User() user: IUser) {
    return this.usersService.uploadFile(file, user);
  }
}
