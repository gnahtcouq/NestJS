import { IsNotEmpty } from 'class-validator';

//data transfer object for creating a Faculty
export class CreateFacultyDto {
  @IsNotEmpty({
    message: 'Name không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Description không được để trống',
  })
  description: string;
}
