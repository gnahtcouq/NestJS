import { OmitType } from '@nestjs/mapped-types';
import { CreateIncomeCategoryDto } from './create-income-category.dto';
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
  description: string;

  @IsNotEmpty()
  year: Date;

  @IsNotEmpty()
  budget: string;

  @IsNotEmpty()
  updatedAt: Date;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateIncomeCategoryDto extends OmitType(
  CreateIncomeCategoryDto,
  [],
) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung danh mục thu không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Dự toán không được để trống',
  })
  budget: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Năm không được để trống',
  })
  year: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
