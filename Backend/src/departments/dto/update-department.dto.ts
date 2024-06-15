import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mô tả không được để trống',
  })
  description: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Logo không được để trống',
  })
  logo: string;
}
