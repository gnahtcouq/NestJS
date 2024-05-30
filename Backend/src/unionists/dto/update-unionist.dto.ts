import { PartialType } from '@nestjs/mapped-types';
import { CreateUnionistDto } from './create-unionist.dto';

export class UpdateUnionistDto extends PartialType(CreateUnionistDto) {}
