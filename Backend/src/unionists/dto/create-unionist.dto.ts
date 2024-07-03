import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Department {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateUnionistDto {
  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  password: string;

  @IsNotEmpty({
    message: 'Ngày sinh không được để trống',
  })
  dateOfBirth: Date;

  @IsNotEmpty({
    message: 'Giới tính không được để trống',
  })
  gender: string;

  @IsNotEmpty({
    message: 'Địa chỉ không được để trống',
  })
  address: string;

  @IsOptional({
    message: 'CCCD không được để trống',
  })
  CCCD: string;

  @IsNotEmpty({
    message: 'Vai trò không được để trống',
  })
  @IsMongoId({
    message: 'Vai trò không đúng định dạng',
  })
  role: mongoose.Schema.Types.ObjectId;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Department)
  department: Department;

  @IsNotEmpty({
    message: 'Ngày chuyển đến không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày chuyển đến không đúng định dạng' })
  joiningDate: Date;

  @IsNotEmpty({
    message: 'Ngày chuyển đi không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày chuyển đi không đúng định dạng' })
  leavingDate: Date;

  @IsNotEmpty({
    message: 'Ngày vào công đoàn không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày vào công đoàn không đúng định dạng' })
  unionEntryDate: Date;

  @IsOptional()
  note?: string;
}
