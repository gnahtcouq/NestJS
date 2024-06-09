import { IsMongoId, IsNotEmpty } from 'class-validator';
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

  @IsNotEmpty({ message: 'Tên văn bản không được để trống' })
  name: string;
}

export class CreateUserDocDto {
  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Tên văn bản không được để trống' })
  name: string;
}
