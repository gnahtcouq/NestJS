/* eslint-disable prettier/prettier */
import { OmitType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Transform, Type } from 'class-transformer';

// export class UpdateUnionistDto extends PartialType(CreateUnionistDto) {}
export class UpdateUnionistPermissionsDto extends OmitType(CreateUnionistDto, [
  'password',
] as const) {
  @IsOptional()
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  name: string;

  @IsOptional()
  email: string;

  @IsOptional()
  dateOfBirth: Date;

  @IsOptional()
  gender: string;

  @IsOptional()
  address: string;

  @IsOptional()
  CCCD: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Ngày chuyển đến không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày chuyển đến không đúng định dạng' })
  joiningDate: Date;

  @IsOptional()
  @IsNotEmpty({
    message: 'Ngày chuyển đi không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày chuyển đi không đúng định dạng' })
  leavingDate: Date;

  @IsOptional()
  @IsNotEmpty({
    message: 'Ngày vào công đoàn không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày vào công đoàn không đúng định dạng' })
  unionEntryDate: Date;

  @IsOptional()
  @IsNotEmpty({ message: 'Quyền hạn không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Mỗi quyền hạn phải có định dạng là mongo object ID',
  })
  @IsArray({ message: 'Quyền hạn phải có định dạng là mảng' })
  permissions: mongoose.Schema.Types.ObjectId[];

  @IsOptional()
  @IsNotEmpty({ message: 'ID đơn vị không được để trống' })
  departmentId: string;
}
