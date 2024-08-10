import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { IsAmountInRange } from 'src/util/is-amount-in-range.validator';
import { IsValidDateRange } from 'src/util/is-valid-date-range.validator';
import { IsValidIncomeCategoryCode } from 'src/util/is-valid-income-category-code.validator';
import { IsValidReceiptCode } from 'src/util/is-valid-receipt-code.validator';

export class CreateReceiptDto {
  @IsNotEmpty({ message: 'Mã phiếu thu không được để trống' })
  @IsValidReceiptCode()
  id: string;

  @IsNotEmpty({
    message: 'Nội dung thu không được để trống',
  })
  @MaxLength(50, {
    message: 'Nội dung thu phải có độ dài dưới 50 kí tự',
  })
  description: string;

  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Thời gian thu không đúng định dạng' })
  @IsValidDateRange()
  time: Date;

  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  @IsAmountInRange(1000, 10000000000)
  amount: string;

  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  @Matches(/^STU\d{5}$/, {
    message: 'Mã thành viên phải có định dạng STU00001 với 00001 là số',
  })
  userId: string;

  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  @IsValidIncomeCategoryCode()
  incomeCategoryId: string;

  // @IsOptional()
  // documentId: string;
}
