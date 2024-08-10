import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({
    message: 'Tên đơn vị không được để trống',
  })
  @MaxLength(50, {
    message: 'Tên đơn vị phải có độ dài dưới 50 kí tự',
  })
  name: string;

  @IsNotEmpty({
    message: 'Mô tả không được để trống',
  })
  @MaxLength(20000, {
    message: 'Mô tả phải có độ dài dưới 20.000 kí tự',
  })
  description: string;

  @IsNotEmpty({
    message: 'Logo không được để trống',
  })
  logo: string;
}
