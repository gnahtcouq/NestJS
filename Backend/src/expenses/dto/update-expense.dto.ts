import { OmitType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
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

export class UpdateExpenseDto extends OmitType(CreateExpenseDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Mã phiếu chi không được để trống' })
  id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  time: Date;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  amount: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã thành viên không được để trống',
  })
  userId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  expenseCategoryId: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
