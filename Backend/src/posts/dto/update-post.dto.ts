import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdatePostDto extends PartialType(CreatePostDto) {}
