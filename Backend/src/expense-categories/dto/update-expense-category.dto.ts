import { OmitType } from '@nestjs/mapped-types';
import { CreateExpenseCategoryDto } from './create-expense-category.dto';
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

export class UpdateExpenseCategoryDto extends OmitType(
  CreateExpenseCategoryDto,
  ['id'],
) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
