import { OmitType } from '@nestjs/mapped-types';
import { CreateFeeDto } from './create-fee.dto';
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
  monthYear: string;

  @IsNotEmpty()
  fee: string;

  @IsNotEmpty()
  updatedAt: Date;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateFeeDto extends OmitType(CreateFeeDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã công đoàn viên không được để trống',
  })
  unionistId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Tháng và năm không được để trống',
  })
  monthYear: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Lệ phí không được để trống',
  })
  fee: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Lịch sử không được để trống' })
  @IsArray({ message: 'Lịch sử có định dạng là mảng' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
