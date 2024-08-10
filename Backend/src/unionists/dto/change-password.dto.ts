import { IsNotEmpty, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message:
      'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
  })
  newPassword: string;
}
