import { OmitType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateExpenseDto extends OmitType(CreateExpenseDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Mã phiếu chi không được để trống' })
  expenseId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã thành viên không được để trống',
  })
  userId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  time: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  amount: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  expenseCategoryId: string;
}
