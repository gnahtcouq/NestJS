import { OmitType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateReceiptDto extends OmitType(CreateReceiptDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Mã phiếu thu không được để trống' })
  receiptId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'ID Thành viên không được để trống',
  })
  userId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Nội dung thu không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Thời gian thu không được để trống',
  })
  time: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Số tiền thu không được để trống',
  })
  amount: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã danh mục thu không được để trống',
  })
  incomeCategoryId: string;
}
