import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
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
  id: string;

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
  @IsOptional()
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Tên CV/VB không được để trống' })
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
