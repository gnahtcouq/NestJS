import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class User {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

class ExpenseCategory {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  description: string;
}

export class CreateExpenseDto {
  @IsNotEmpty({
    message: 'Thành viên không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  @Prop()
  description: string;

  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  @Prop()
  time: string;

  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  @Prop()
  amount: string;

  @IsNotEmpty({
    message: 'Danh mục chi không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => ExpenseCategory)
  expenseCategory: ExpenseCategory;
}
