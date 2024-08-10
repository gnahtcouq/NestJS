import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateUserPermissionsDto extends OmitType(CreateUserDto, [
  'email',
  'password',
  'name',
  'dateOfBirth',
  'gender',
  'phoneNumber',
  'address',
  'CCCD',
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
