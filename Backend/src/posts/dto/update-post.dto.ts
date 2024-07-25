import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  name: string;

  @IsOptional()
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
}
