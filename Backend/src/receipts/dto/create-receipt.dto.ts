import { IsNotEmpty } from 'class-validator';

export class CreateReceiptDto {
  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'Mã phiếu thu không được để trống' })
  receiptId: string;

  @IsNotEmpty({
    message: 'Nội dung thu không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  time: Date;

  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  amount: string;

  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  incomeCategoryId: string;
}
