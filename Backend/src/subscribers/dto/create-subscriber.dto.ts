import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Chủ đề không được để trống' })
  @IsArray({ message: 'Chủ đề phải có định dạng là mảng' })
  @IsString({ each: true, message: 'Chủ đề phải có định dạng là chuỗi' })
  threads: string[];
}
