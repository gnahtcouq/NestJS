/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { IUnionist } from 'src/unionists/unionists.interface';
import { UnionistsService } from 'src/unionists/unionists.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private unionistsService: UnionistsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser | IUnionist) {
    const { _id, name, email, type } = payload;

    //cần gắn thêm permissions vào req.user
    const temp1 = await this?.usersService?.findOne(_id);
    const temp2 = await this?.unionistsService?.findOne(_id);
    const permissions = temp1?.permissions ?? temp2?.permissions ?? [];

    //req.user
    return {
      _id,
      name,
      email,
      permissions,
      type,
    };
  }
}
