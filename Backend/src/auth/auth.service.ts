/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { UnionistsService } from 'src/unionists/unionists.service';
import { IUnionist } from 'src/unionists/unionists.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private unionistsService: UnionistsService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  //username, password là 2 tham số thư viện passport ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        const temp = await this.usersService.findOne(user._id.toString());

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
          type: 'user',
        };

        return objUser;
      }
    }

    return null;
  }

  async validateUnionist(username: string, pass: string): Promise<any> {
    const unionist = await this.unionistsService.findOneByUserName(username);
    if (unionist) {
      const isValid = this.unionistsService.isValidPassword(
        pass,
        unionist.password,
      );
      if (isValid === true) {
        const temp = await this.unionistsService.findOne(
          unionist._id.toString(),
        );

        const objUser = {
          ...unionist.toObject(),
          permissions: temp?.permissions ?? [],
          type: 'unionist',
        };

        return objUser;
      }
    }

    return null;
  }

  async login(user: IUser | IUnionist, response: Response) {
    const { _id, id, name, email, permissions, type } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      id,
      name,
      email,
      type,
    };

    const refresh_token = this.createRefreshToken(payload);

    // Update user with refresh token
    if (type === 'user') {
      await this?.usersService?.updateUserToken(refresh_token, _id);
    } else if (type === 'unionist') {
      await this?.unionistsService?.updateUnionistToken(refresh_token, _id);
    }

    //set refresh_token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        id,
        name,
        email,
        permissions,
        type,
      },
    };
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  createRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refreshToken;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let user = await this.usersService.findUserByToken(refreshToken);
      if (!user) {
        user = await this.unionistsService.findUnionistByToken(refreshToken);
      }
      if (user) {
        //update refresh_token
        const { _id, id, name, email } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          id,
          name,
          email,
        };

        const refresh_token = this.createRefreshToken(payload);

        //update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id.toString());

        const temp = (
          await this.usersService.findOne(_id.toString())
        ).toObject();

        //set refresh_token as cookies
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            id,
            name,
            email,
            permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException(
          'Refresh token không hợp lệ. Vui lòng đăng nhập!',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Refresh token không hợp lệ. Vui lòng đăng nhập!',
      );
    }
  };

  logout = async (response: Response, user: IUser | IUnionist) => {
    await this?.usersService?.updateUserToken('', user._id);
    await this?.unionistsService?.updateUnionistToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  };
}
