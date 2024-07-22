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
