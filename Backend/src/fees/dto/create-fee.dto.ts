import { IsNotEmpty } from 'class-validator';

export class CreateFeeDto {
  @IsNotEmpty({
    message: 'Mã công đoàn viên không được để trống',
  })
  unionistId: string;

  @IsNotEmpty({
    message: 'Tháng và năm không được để trống',
  })
  monthYear: string;

  @IsNotEmpty({
    message: 'Lệ phí không được để trống',
  })
  fee: string;
}
