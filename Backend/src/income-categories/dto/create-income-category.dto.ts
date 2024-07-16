import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';

export class CreateIncomeCategoryDto {
  @IsNotEmpty({
    message: 'Nội dung danh mục thu không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'Dự toán không được để trống',
  })
  @Prop()
  budget: string;

  @IsNotEmpty({
    message: 'Năm không được để trống',
  })
  @Prop()
  year: string;
}
