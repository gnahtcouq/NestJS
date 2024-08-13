import { OmitType } from '@nestjs/mapped-types';
import { CreateZnssDto } from './create-znss.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateZnssDto extends OmitType(CreateZnssDto, []) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
}
