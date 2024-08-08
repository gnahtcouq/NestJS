import { OmitType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateInfoUnionistDto extends OmitType(CreateUnionistDto, [
  'email',
  'password',
  'CCCD',
  'departmentId',
  'joiningDate',
  'leavingDate',
  'unionEntryDate',
  'permissions',
  'note',
] as const) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
}
