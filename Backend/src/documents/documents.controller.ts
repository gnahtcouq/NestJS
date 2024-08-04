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
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateUserDocDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ResponseMessage('Tạo mới văn bản')
  create(@Body() createUserDocDto: CreateUserDocDto, @User() user: IUser) {
    return this.documentsService.create(createUserDocDto, user);
  }

  @Post('by-user')
  @ResponseMessage('Lấy danh sách văn bản theo người dùng')
  getDocumentsByUser(@User() user: IUser) {
    return this.documentsService.findByUsers(user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách văn bản')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.documentsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin văn bản')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật trạng thái văn bản')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.documentsService.update(id, status, user);
  }

  @Put(':id')
  @ResponseMessage('Cập nhật tên văn bản')
  async updateName(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: IUser,
  ) {
    return this.documentsService.updateName(id, updateDocumentDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa văn bản')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.documentsService.remove(id, user);
  }

  @Post('count')
  @ResponseMessage('Lấy số lượng văn bản')
  countDocuments() {
    return this.documentsService.countDocuments();
  }
}
