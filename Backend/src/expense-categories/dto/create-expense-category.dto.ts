import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { IsAmountInRange } from 'src/util/is-amount-in-range.validator';
import { IsValidExpenseCategoryCode } from 'src/util/is-valid-expense-category-code.validator';
import { IsValidYear } from 'src/util/is-valid-year-range.validator';

export class CreateExpenseCategoryDto {
  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  @IsValidExpenseCategoryCode()
  id: string;

  @IsNotEmpty({
    message: 'Nội dung danh mục chi không được để trống',
  })
  @MaxLength(150, {
    message: 'Nội dung danh mục chi phải có độ dài dưới 150 kí tự',
  })
  description: string;

  @IsNotEmpty({
    message: 'Dự toán không được để trống',
  })
  @IsAmountInRange(1000, 10000000000)
  @Prop()
  budget: string;

  @IsNotEmpty({
    message: 'Năm không được để trống',
  })
  @IsValidYear()
  @Prop()
  year: string;
}
