import { IsNotEmpty } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'Mã phiếu chi không được để trống' })
  id: string;

  @IsNotEmpty({
    message: 'Nội dung chi không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'Thời gian chi không được để trống',
  })
  time: Date;

  @IsNotEmpty({
    message: 'Số tiền chi không được để trống',
  })
  amount: string;

  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  userId: string;

  @IsNotEmpty({
    message: 'Mã danh mục chi không được để trống',
  })
  expenseCategoryId: string;

  // @IsNotEmpty({
  //   message: 'Mã văn bản không được để trống',
  // })
  // documentId: string;
}
