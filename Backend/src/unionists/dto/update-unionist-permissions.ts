import { OmitType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateUnionistPermissionsDto extends OmitType(CreateUnionistDto, [
  'email',
  'password',
  'name',
  'dateOfBirth',
  'gender',
  'phoneNumber',
  'address',
  'CCCD',
  'joiningDate',
  'leavingDate',
  'unionEntryDate',
  'departmentId',
] as const) {
  @IsOptional()
  @IsNotEmpty({ message: 'Quyền hạn không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Mỗi quyền hạn phải có định dạng là mongo object ID',
  })
  @IsArray({ message: 'Quyền hạn phải có định dạng là mảng' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
