import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // /=> api (restful api)
  @Render('home') // /=> view (ejs)
  getHello() {
    // return "this.appService.getHello()";
  }
}
