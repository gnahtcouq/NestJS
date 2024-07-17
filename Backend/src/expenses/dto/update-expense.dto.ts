import { OmitType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

class User {
  @IsOptional()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmpty()
  name: string;
}

class Expense {
  @IsOptional()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmpty()
  description: string;
}

export class UpdateExpenseDto extends OmitType(CreateExpenseDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thành viên không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  time: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  amount: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Danh mục chi không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Expense)
  expense: Expense;
}
