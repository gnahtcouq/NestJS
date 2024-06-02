import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'ApiPath không được để trống' })
  apiPath: string;

  @IsNotEmpty({ message: 'Method không được để trống' })
  method: string;

  @IsNotEmpty({ message: 'Module không được để trống' })
  module: string;
}
