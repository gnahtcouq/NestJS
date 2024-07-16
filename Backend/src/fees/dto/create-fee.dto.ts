import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Unionist {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateFeeDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Unionist)
  unionist: Unionist;

  @IsNotEmpty({
    message: 'Tháng và năm không được để trống',
  })
  monthYear: string;

  @IsNotEmpty({
    message: 'Lệ phí không được để trống',
  })
  fee: string;
}
