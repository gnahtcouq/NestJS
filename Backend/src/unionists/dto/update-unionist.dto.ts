import { OmitType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

class Department {
  @IsOptional()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmpty()
  name: string;
}
export class UpdateUnionistDto extends OmitType(CreateUnionistDto, [
  'password',
] as const) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'CCCD không được để trống',
  })
  CCCD: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Vai trò không được để trống',
  })
  @IsMongoId({
    message: 'Vai trò không đúng định dạng',
  })
  role: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Department)
  department: Department;
}
