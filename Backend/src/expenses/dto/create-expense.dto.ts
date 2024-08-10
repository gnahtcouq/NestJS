import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsAmountInRange } from 'src/util/is-amount-in-range.validator';
import { IsValidDateRange } from 'src/util/is-valid-date-range.validator';
import { IsValidExpenseCategoryCode } from 'src/util/is-valid-expense-category-code.validator';
import { IsValidExpenseCode } from 'src/util/is-valid-expense-code.validator';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'Mã phiếu chi không được để trống' })
  @IsValidExpenseCode()
  id: string;

  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  @MaxLength(50, {
    message: 'Nội dung chi phải có độ dài dưới 50 kí tự',
  })
  description: string;

  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Thời gian chi không đúng định dạng' })
  @IsValidDateRange()
  time: Date;

  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  @IsAmountInRange(1000, 10000000000)
  amount: string;

  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  @Matches(/^STU\d{5}$/, {
    message: 'Mã thành viên phải có định dạng STU00001 với 00001 là số',
  })
  userId: string;

  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  @IsValidExpenseCategoryCode()
  expenseCategoryId: string;

  // @IsNotEmpty({
  //   message: 'Mã CV/VB không được để trống',
  // })
  // documentId: string;
}
