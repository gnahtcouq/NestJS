import { OmitType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

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
  time: Date;

  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  updatedAt: Date;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateReceiptDto extends OmitType(CreateReceiptDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Mã phiếu thu không được để trống' })
  id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung thu không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  time: Date;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  amount: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã thành viên không được để trống',
  })
  userId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  incomeCategoryId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
