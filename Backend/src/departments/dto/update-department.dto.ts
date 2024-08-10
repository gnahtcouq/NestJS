import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateDepartmentDto } from 'src/departments/dto/create-department.dto';

export class UpdateDepartmentDto extends OmitType(CreateDepartmentDto, []) {
  @IsOptional()
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id: string;
}
