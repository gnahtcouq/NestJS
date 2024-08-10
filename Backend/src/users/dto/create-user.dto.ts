import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';
import { IsAdult } from 'src/util/is-adult.validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateUserDto {
  @IsNotEmpty({
    message: 'Họ và tên không được để trống',
  })
  @MaxLength(30, {
    message: 'Họ và tên phải có độ dài dưới 30 kí tự',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @Matches(/@stu\.edu\.vn$/, {
    message: 'Email phải có đuôi @stu.edu.vn',
  })
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message:
      'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
  })
  password: string;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsNotEmpty({
    message: 'Ngày sinh không được để trống',
  })
  @IsDate({
    message: 'Ngày sinh không đúng định dạng',
  })
  @IsAdult({
    message: 'Ngày sinh không hợp lệ hoặc chưa đủ 18 tuổi',
  })
  dateOfBirth: Date;

  @IsNotEmpty({
    message: 'Giới tính không được để trống',
  })
  @IsEnum(Gender, {
    message: 'Giới tính phải là MALE hoặc FEMALE hoặc OTHER',
  })
  gender: Gender;

  @IsOptional()
  @Matches(/^(03|05|07|08|09)[0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng',
  })
  phoneNumber: string;

  @IsOptional()
  @MaxLength(150, {
    message: 'Địa chỉ phải có độ dài dưới 150 kí tự',
  })
  address: string;

  @IsOptional()
  @Matches(/^\d{12}$/, {
    message: 'CCCD phải là một chuỗi số có 12 chữ số',
  })
  CCCD: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Quyền hạn không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Mỗi quyền hạn phải có định dạng là mongo object ID',
  })
  @IsArray({ message: 'Quyền hạn phải có định dạng là mảng' })
  permissions: mongoose.Schema.Types.ObjectId[];

  @IsOptional()
  note: string;
}

export class RegisterUserDto {
  @IsNotEmpty({
    message: 'Họ và tên không được để trống',
  })
  @MaxLength(30, {
    message: 'Họ và tên phải có độ dài dưới 30 kí tự',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @Matches(/@stu\.edu\.vn$/, {
    message: 'Email phải có đuôi @stu.edu.vn',
  })
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message:
      'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
  })
  password: string;

  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  @IsNotEmpty({
    message: 'Ngày sinh không được để trống',
  })
  @IsDate({
    message: 'Ngày sinh không đúng định dạng',
  })
  @IsAdult({
    message: 'Ngày sinh không hợp lệ hoặc chưa đủ 18 tuổi',
  })
  dateOfBirth: Date;

  @IsNotEmpty({
    message: 'Giới tính không được để trống',
  })
  @IsEnum(Gender, {
    message: 'Giới tính phải là MALE hoặc FEMALE hoặc OTHER',
  })
  gender: Gender;

  @IsOptional()
  @Matches(/^(03|05|07|08|09)[0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng',
  })
  phoneNumber: string;

  @IsOptional()
  @MaxLength(150, {
    message: 'Địa chỉ phải có độ dài dưới 150 kí tự',
  })
  address: string;

  @IsOptional()
  @MaxLength(50, {
    message: 'Ghi chú phải có độ dài dưới 50 kí tự',
  })
  note: string;
}
