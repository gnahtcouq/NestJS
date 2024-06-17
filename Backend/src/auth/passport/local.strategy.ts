/* eslint-disable prettier/prettier */
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      // Nếu validateUser không thành công, thử validateUnionist
      const unionist = await this.authService.validateUnionist(
        username,
        password,
      );
      if (!unionist) {
        throw new UnauthorizedException(
          'Tài khoản hoặc mật khẩu không chính xác',
        );
      }
      return unionist;
    }

    return user;
  }
}
