import { OmitType } from '@nestjs/mapped-types';
import { CreateFeeDto } from './create-fee.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFeeDto extends OmitType(CreateFeeDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mã công đoàn viên không được để trống',
  })
  unionistId: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Tháng và năm không được để trống',
  })
  monthYear: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Lệ phí không được để trống',
  })
  fee: string;
}
