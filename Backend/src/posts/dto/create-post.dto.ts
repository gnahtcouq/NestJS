import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
class Department {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  logo: string;
}

export class CreatePostDto {
  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Chủ đề không được để trống',
  })
  @IsArray({
    message: 'Chủ đề phải có định dạng là mảng',
  })
  @IsString({
    each: true, //kiểm tra từng phần tử trong mảng nếu không phải là string sẽ báo lỗi
    message: 'Chủ đề phải có định dạng là chuỗi',
  })
  threads: string[];

  // @IsNotEmptyObject()
  // @IsObject()
  // @ValidateNested()
  // @Type(() => Department)
  // department: Department;

  @IsNotEmpty({
    message: 'Mô tả không được để trống',
  })
  description: string;

  // @IsNotEmpty({
  //   message: 'Ngày bắt đầu không được để trống',
  // })
  // @Transform(({ value }) => new Date(value))
  // @IsDate({ message: 'Ngày bắt đầu không đúng định dạng' })
  // startDate: Date;

  // @IsNotEmpty({
  //   message: 'Ngày kết thúc không được để trống',
  // })
  // @Transform(({ value }) => new Date(value))
  // @IsDate({ message: 'Ngày kết thúc không đúng định dạng' })
  // endDate: Date;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsBoolean({ message: 'Trạng thái phải có định dạng là boolean' })
  isActive: boolean;
}
