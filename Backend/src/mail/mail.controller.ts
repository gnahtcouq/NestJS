import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  async handleTestEmail() {
    await this.mailerService.sendMail({
      to: 'comehere.thang@gmail.com',
      from: '"Support Team" <support@stu.id.vn>', // override default from
      subject: 'Thông báo mới từ Đại học Công nghệ Sài Gòn',
      html: '<b>Welcome...</b>', // HTML body content
    });
  }
}
