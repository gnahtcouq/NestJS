import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
export class CreateDocumentDto {
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @IsNotEmpty({ message: 'Email không được để trống' })
  @Matches(/@stu\.id\.vn$/, {
    message: 'Email phải có đuôi @stu.id.vn',
  })
  email: string;

  @IsNotEmpty({ message: 'Mã thành viên không được để trống' })
  @Matches(/^STU\d{5}$/, {
    message: 'Mã thành viên phải có định dạng STU00001 với 00001 là số',
  })
  userId: string;

  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(Status, {
    message: 'Trạng thái phải là ACTIVE hoặc INACTIVE',
  })
  status: Status;

  @IsNotEmpty({ message: 'Tiêu đề CV/VB không được để trống' })
  @MaxLength(150, {
    message: 'Tiêu đề CV/VB phải có độ dài dưới 150 kí tự',
  })
  name: string;

  @IsOptional()
  id: string;
}

export class CreateUserDocDto {
  @IsNotEmpty({ message: 'URL không được để trống' })
  url: string;

  @IsOptional()
  id: string;

  @IsNotEmpty({ message: 'Tiêu đề CV/VB không được để trống' })
  name: string;
}
