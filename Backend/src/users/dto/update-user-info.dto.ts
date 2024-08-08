import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateInfoUserDto extends OmitType(CreateUserDto, [
  // 'email',
  'password',
  'CCCD',
  'permissions',
  'note',
] as const) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
}
