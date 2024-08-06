import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateDocumentDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'Tên CV/VB không được để trống' })
  name: string;

  @IsOptional()
  id: string;
}

export class CreateUserDocDto {
  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsOptional()
  id: string;

  @IsNotEmpty({ message: 'Tên CV/VB không được để trống' })
  name: string;
}
