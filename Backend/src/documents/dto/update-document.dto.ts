import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class UpdatedBy {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

class History {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  updatedAt: Date;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'Tên văn bản không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
