import { ConfigService } from '@nestjs/config';
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
import { convertSlug } from 'src/util/utils';

@Controller('mail')
export class MailController {
  constructor(
    private mailerService: MailerService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Post.name)
    private postModel: SoftDeleteModel<PostDocument>,

    private configService: ConfigService,
  ) {}

  // @Cron(CronExpression.EVERY_5_SECONDS)
  // testCron() {
  //   console.log('Every 5 seconds');
  // }

  @Get()
  @Public()
  @ResponseMessage('Gửi email')
  @Cron('0 0 19 * * *') // 19h hàng ngày
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsThreads = subs.threads;
      const postWithMatchingThreads = await this.postModel
        .find({
          threads: { $in: subsThreads },
          isActive: true,
        })
        .sort({ updatedAt: -1 }) // Sort by updatedAt date in descending order
        .limit(6); // Limit to 6 posts
      if (postWithMatchingThreads?.length) {
        const posts = postWithMatchingThreads.map((item) => {
          const slug = convertSlug(item.name);
          const url = `${this.configService.get<string>(
            'FRONTEND_URL',
          )}/post/${slug}?id=${item._id}`;
          return {
            name: item.name,
            threads: item.threads,
            url: url,
          };
        });

        await this.mailerService.sendMail({
          to: subs.email,
          from: '"Saigon Technology University" <support@stu.id.vn>',
          subject: 'Thông báo mới từ Đại học Công nghệ Sài Gòn',
          template: 'new-post',
          context: {
            receiver: subs.name,
            posts: posts,
            urlAllPost: `${this.configService.get<string>(
              'FRONTEND_URL',
            )}/post`,
          },
        });
      }
    }
  }
}
