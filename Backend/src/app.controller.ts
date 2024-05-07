import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get() // /=> api (restful api)
  @Render('home') // /=> view (ejs)
  handleHomePage() {
    //port from .env
    console.log('PORT: ', this.configService.get<string>('PORT'));

    const message = this.appService.getHello();
    return { message: message };
  }

  getHello() {
    // return "this.appService.getHello()";
  }
}
