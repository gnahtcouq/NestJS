/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import {
  Public,
  ResponseMessage,
  Unionist,
  User,
} from 'src/decorator/customize';
import { IUnionist } from 'src/unionists/unionists.interface';
import { UnionistsService } from 'src/unionists/unionists.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private unionistsService: UnionistsService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user || req.unionist, response);
  }

  @Public() //không dùng JWT để xác thực
  @ResponseMessage('Tạo tài khoản') //trả về response message
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage('Lấy thông tin người dùng')
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    (await this.usersService.findOne(user._id)) as any;
    return { user };
  }

  @Public()
  @ResponseMessage('Lấy thông tin người dùng bởi Refresh token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Đăng xuất')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
