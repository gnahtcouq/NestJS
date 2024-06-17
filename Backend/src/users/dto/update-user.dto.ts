import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'CCCD không được để trống',
  })
  CCCD: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Vai trò không được để trống',
  })
  @IsMongoId({
    message: 'Vai trò không đúng định dạng',
  })
  role: mongoose.Schema.Types.ObjectId;
}
