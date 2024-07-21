import { OmitType } from '@nestjs/mapped-types';
import { CreateExpenseCategoryDto } from './create-expense-category.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateExpenseCategoryDto extends OmitType(
  CreateExpenseCategoryDto,
  [],
) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  expenseCategoryId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung danh mục chi không được để trống',
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
