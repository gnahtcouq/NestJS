import { IsEmail, IsNotEmpty } from 'class-validator';

//data transfer object for creating a Faculty
export class CreateFacultyDto {
  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Mô tả không được để trống',
  })
  description: string;
}
