import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentsDto } from './create-department.dto';

export class UpdateDepartmentsDto extends PartialType(CreateDepartmentsDto) {}
