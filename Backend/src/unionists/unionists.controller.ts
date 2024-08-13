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
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UnionistsService } from './unionists.service';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';
import { IUnionist } from 'src/unionists/unionists.interface';
import {
  Public,
  ResponseMessage,
  Unionist,
  User,
} from 'src/decorator/customize';
import { UpdateUnionistPermissionsDto } from 'src/unionists/dto/update-unionist-permissions';
import { ChangePasswordDto } from 'src/unionists/dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUser } from 'src/users/users.interface';
import { UpdateInfoUnionistDto } from 'src/unionists/dto/update-unionist-info.dto';

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

  @Get(':id')
  @ResponseMessage('Lấy thông tin công đoàn viên')
  async findOne(@Param('id') id: string) {
    const foundUnionist = await this.unionistsService.findOne(id);
    return foundUnionist;
  }

  @Public()
  @Get('name/:id')
  @ResponseMessage('Lấy tên công đoàn viên theo mã công đoàn viên')
  async findUnionistNameWithUnionistId(@Param('id') id: string) {
    const foundUnionist =
      await this.unionistsService.findUnionistNameWithUnionistId(id);
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

  @Patch('info/:id')
  @ResponseMessage('Công đoàn viên cập nhật thông tin')
  async updateInfo(
    @Param('id') id: string,
    @Body() updateInfoUnionistDto: UpdateInfoUnionistDto,
    @User() user: IUser,
  ) {
    let updatedUnionist = await this.unionistsService.updateInfo(
      id,
      updateInfoUnionistDto,
      user,
    );
    return updatedUnionist;
  }

  @Put(':id')
  @ResponseMessage('Cập nhật quyền hạn công đoàn viên')
  updateUnionistPermissions(
    @Param('id') id: string,
    @Body() updateUnionistPermissionsDto: UpdateUnionistPermissionsDto,
    @User() user: IUser,
  ) {
    return this.unionistsService.updateUnionistPermissions(
      id,
      updateUnionistPermissionsDto,
      user,
    );
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

  @Post('request-change-email/:id')
  @ResponseMessage('Gửi yêu cầu thay đổi email')
  async requestChangeEmail(
    @Param('id') id: string,
    @Body('newEmail') newEmail: string,
    @Unionist() unionist: IUnionist,
  ) {
    const result = await this.unionistsService.requestChangeEmail(
      id,
      newEmail,
      unionist,
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
    const result = await this.unionistsService.confirmChangeEmail(
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
    const result = await this.unionistsService.requestForgotPassword(email);
    return result;
  }

  @Public()
  @Post('confirm-forgot-password/:id')
  @ResponseMessage('Xác nhận đặt lại mật khẩu')
  async confirmForgotPassword(
    @Param('id') id: string,
    @Body('verificationCodePassword') verificationCodePassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.unionistsService.confirmForgotPassword(
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
    const result = await this.unionistsService.changePassword(
      id,
      changePasswordDto,
    );
    return { success: result };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Tải lên danh sách công đoàn viên')
  async upload(@UploadedFile() file: Express.Multer.File, @User() user: IUser) {
    return this.unionistsService.uploadFile(file, user);
  }
}
