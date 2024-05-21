import { IsNotEmpty } from 'class-validator';
import { Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class CreateDocumentDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'ID đơn vị không được để trống' })
  departmentId: mongoose.Schema.Types.ObjectId;

  //   @IsNotEmpty({ message: 'ID bài viết không được để trống' })
  //   postId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserDocDto {
  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'ID đơn vị không được để trống' })
  departmentId: mongoose.Schema.Types.ObjectId;

  //   @IsNotEmpty({ message: 'ID bài viết không được để trống' })
  //   postId: mongoose.Schema.Types.ObjectId;
}
