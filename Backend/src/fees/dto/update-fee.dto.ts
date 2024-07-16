import { OmitType } from '@nestjs/mapped-types';
import { CreateFeeDto } from './create-fee.dto';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

class Unionist {
  @IsOptional()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmpty()
  name: string;
}

export class UpdateFeeDto extends OmitType(CreateFeeDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Công đoàn viên không được để trống',
  })
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Unionist)
  unionist: Unionist;

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
}
