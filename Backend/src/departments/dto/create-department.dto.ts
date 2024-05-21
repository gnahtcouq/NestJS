import { IsNotEmpty } from 'class-validator';

//data transfer object for creating a Departments
export class CreateDepartmentDto {
  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Mô tả không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'Logo không được để trống',
  })
  logo: string;
}
