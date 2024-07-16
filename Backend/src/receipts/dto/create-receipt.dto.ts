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

class IncomeCategory {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  description: string;
}

export class CreateReceiptDto {
  @IsNotEmpty({
    message: 'Thành viên không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsNotEmpty({
    message: 'Nội dung thu không được để trống',
  })
  @Prop()
  description: string;

  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  @Prop()
  time: string;

  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  @Prop()
  amount: string;

  @IsNotEmpty({
    message: 'Danh mục thu không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => IncomeCategory)
  incomeCategory: IncomeCategory;
}
