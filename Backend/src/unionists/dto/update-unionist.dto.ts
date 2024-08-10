import { OmitType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUnionistDto extends OmitType(CreateUnionistDto, [
  'password',
] as const) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
}
