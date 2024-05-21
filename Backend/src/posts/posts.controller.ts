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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ResponseMessage('Tạo bài viết')
  create(@Body() createPostDto: CreatePostDto, @User() user: IUser) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách bài viết')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string, // query string
  ) {
    return this.postsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin bài viết')
  async findOne(@Param('id') id: string) {
    const foundPost = await this.postsService.findOne(id);
    return foundPost;
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật bài viết')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @User() user: IUser,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa bài viết')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.postsService.remove(id, user);
  }
}
