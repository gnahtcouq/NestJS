import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import { Post, PostDocument } from 'src/posts/schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Post.name)
    private postModel: SoftDeleteModel<PostDocument>,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  testCron() {
    console.log('Every 5 seconds');
  }

  @Get()
  @Public()
  @ResponseMessage('Gửi email')
  async handleTestEmail() {
    const posts = [
      {
        name: 'Thông báo về việc Đăng ký bảo hiểm y tế và bảo hiểm tai nạn đợt 8 năm học 2023 - 2024',
        department: 'Khoa Công Nghệ Thông Tin',
        threads: ['THÔNG BÁO', 'QUYẾT ĐỊNH'],
      },
      {
        name: 'Quyết định về việc Ban hành Kế hoạch cải tiến hiệu quả hoạt động của Nhà trường',
        department: 'Khoa Công Nghệ Thông Tin',
        threads: ['THÔNG BÁO', 'QUYẾT ĐỊNH'],
      },
    ];

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsThreads = subs.threads;
      const postWithMatchingThreads = await this.postModel.find({
        threads: { $in: subsThreads },
      });
      if (postWithMatchingThreads?.length) {
        const posts = postWithMatchingThreads.map((item) => {
          return {
            name: item.name,
            department: item.department.name,
            threads: item.threads,
          };
        });

        await this.mailerService.sendMail({
          to: 'comehere.thang@gmail.com',
          from: '"Support Team" <support@stu.id.vn>', // override default from
          subject: 'Thông báo mới từ Đại học Công nghệ Sài Gòn',
          template: 'new-post',
          context: {
            receiver: subs.name,
            posts: posts,
          },
        });
      }
    }
  }
}
