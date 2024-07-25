import { OmitType } from '@nestjs/mapped-types';
import { CreateIncomeCategoryDto } from './create-income-category.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateIncomeCategoryDto extends OmitType(
  CreateIncomeCategoryDto,
  [],
) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung danh mục thu không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Dự toán không được để trống',
  })
  budget: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Năm không được để trống',
  })
  year: string;
}
