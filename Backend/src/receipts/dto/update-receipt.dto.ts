import { OmitType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';
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

class Receipt {
  @IsOptional()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmpty()
  description: string;
}

export class UpdateReceiptDto extends OmitType(CreateReceiptDto, []) {
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
    message: 'Nội dung thu không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  time: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  amount: string;

  @IsNotEmpty({
    message: 'Danh mục thu không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Receipt)
  receipt: Receipt;
}
