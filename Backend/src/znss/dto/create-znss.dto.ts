import { IsNotEmpty } from 'class-validator';

export class CreateZnssDto {
  @IsNotEmpty({
    message: 'access_token không được để trống',
  })
  access_token: string;

  @IsNotEmpty({
    message: 'refresh_token không được để trống',
  })
  refresh_token: string;
}
