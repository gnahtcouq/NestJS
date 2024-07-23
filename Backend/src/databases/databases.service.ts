import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { INIT_PERMISSIONS } from 'src/databases/sample';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/schemas/permission.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';
import {
  Unionist,
  UnionistDocument,
} from 'src/unionists/schemas/unionist.schema';
import { ObjectId } from 'mongodb'; // Import the ObjectId class from the 'mongodb' module
import { UnionistsService } from 'src/unionists/unionists.service';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Unionist.name)
    private unionistModel: SoftDeleteModel<UnionistDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    private configService: ConfigService,
    private userService: UsersService,
    private unionistService: UnionistsService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      //check if already init
      const countUser = await this.userModel.count({});
      const countUnionist = await this.unionistModel.count({});
      const countPermission = await this.permissionModel.count({});

      //create permissions
      if (countPermission === 0)
        await this.permissionModel.insertMany(INIT_PERMISSIONS);

      if (countUser === 0) {
        await this.userModel.insertMany([
          {
            name: 'ADMIN',
            email: 'admin@stu.id.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Nha Trang',
            CCCD: '056202011199',
            note: 'ADMIN',
            permissions: [
              new ObjectId('6694902bda1f6560724cb094'),
              new ObjectId('648ad59adafdb9754f40b881'),
              new ObjectId('648ad5aedafdb9754f40b886'),
              new ObjectId('648ad5c5dafdb9754f40b88b'),
              new ObjectId('648ad5d4dafdb9754f40b890'),
              new ObjectId('648ad5ebdafdb9754f40b895'),
              new ObjectId('648ab415f4328bd3153ee211'),
              new ObjectId('648ab436f4328bd3153ee216'),
              new ObjectId('648ab4d5f4328bd3153ee21b'),
              new ObjectId('648ab4ebf4328bd3153ee220'),
              new ObjectId('648ab5a8072f2a2ef910638d'),
              new ObjectId('6666f05b38171eb82790369c'),
              new ObjectId('648ab6d3fa16b294212e4033'),
              new ObjectId('648ab6e7fa16b294212e4038'),
              new ObjectId('648ab6fdfa16b294212e403d'),
              new ObjectId('648ab719fa16b294212e4042'),
              new ObjectId('66943bdd23978c1c8958970e'),
              new ObjectId('648ab728fa16b294212e4047'),
              new ObjectId('6666f065aad2dbd0e9041226'),
              new ObjectId('6688dfd0a9b3d97d1b368c44'),
              new ObjectId('66890545d40c708b15d2f329'),
              new ObjectId('668b84dce8720bbbd18c7e77'),
              new ObjectId('6697de58af6aeefbf633abf1'),
              new ObjectId('669e3b4c3c56e23fa4af205b'),
              new ObjectId('666f366d683cf1b5e2c9b7f9'),
              new ObjectId('666f3672d8d4bd537d4407ef'),
              new ObjectId('666f3679fdee1d528c846ebe'),
              new ObjectId('666f3680006c1579a34d5ec2'),
              new ObjectId('666f3686b8bab8c9aef4c495'),
              new ObjectId('666f368c80d7a70fa93fd90e'),
              new ObjectId('6694cbb68cc60924a765f673'),
              new ObjectId('6694cc16fda6b0a670cd3e42'),
              new ObjectId('6694cc7cfda6b0a670cd3e4b'),
              new ObjectId('6694cc9d047108a8053a8cce'),
              new ObjectId('6697ee9673975ad0a88c668e'),
              new ObjectId('648ab750fa16b294212e404c'),
              new ObjectId('648ad488dafdb9754f40b846'),
              new ObjectId('648ad499dafdb9754f40b84b'),
              new ObjectId('648ad4a6dafdb9754f40b850'),
              new ObjectId('648ad4ccdafdb9754f40b859'),
              new ObjectId('648ad4d9dafdb9754f40b85e'),
              new ObjectId('6666f06b3254c2be902bfe5e'),
              new ObjectId('648ad4fedafdb9754f40b863'),
              new ObjectId('648ad511dafdb9754f40b868'),
              new ObjectId('648ad522dafdb9754f40b86d'),
              new ObjectId('648ad53bdafdb9754f40b872'),
              new ObjectId('648ad555dafdb9754f40b877'),
              new ObjectId('6684fc817e6150f6975463aa'),
              new ObjectId('648ad56ddafdb9754f40b87c'),
              new ObjectId('6666f037cea8012c358bae9e'),
              new ObjectId('669659a0c5d4e84cd7515859'),
              new ObjectId('66965b6286e8a509567a218e'),
              new ObjectId('66965e152d2ec3b0bfc03595'),
              new ObjectId('66965e332d2ec3b0bfc0359e'),
              new ObjectId('66968e1a0979f9a91572e2ff'),
              new ObjectId('669718d20418310dcc6f2703'),
              new ObjectId('6696d059eb2b81a905bd3132'),
              new ObjectId('6696d084eb2b81a905bd313b'),
              new ObjectId('6696d0b1eb2b81a905bd3144'),
              new ObjectId('6696d0f8eb2b81a905bd3155'),
              new ObjectId('6696d124eb2b81a905bd315e'),
              new ObjectId('66982ece2bec1e24eb383e7b'),
              new ObjectId('6698b48a86d0d641c2df2f30'),
              new ObjectId('6696d059eb2b81a911bd3132'),
              new ObjectId('6696d084eb2b81a912bd313b'),
              new ObjectId('6696d0b1eb2b81a913bd3144'),
              new ObjectId('6696d0f8eb2b81a914bd3155'),
              new ObjectId('6696d124eb2b81a915bd315e'),
              new ObjectId('669833998a337a4d50aeb7f9'),
              new ObjectId('6698b4ad86d0d641c2df2f39'),
              new ObjectId('6696d7d601d85c000b573a7d'),
              new ObjectId('6696d7ff01d85c000b573a86'),
              new ObjectId('6696d82301d85c000b573a8f'),
              new ObjectId('6696d84201d85c000b573a98'),
              new ObjectId('6696d86201d85c000b573aa9'),
              new ObjectId('66983866b6e411bcaa957dbb'),
              new ObjectId('6696d7d601d85c000b529a7d'),
              new ObjectId('6696d7ff01d85c000b530a86'),
              new ObjectId('6696d82301d85c000b531a8f'),
              new ObjectId('6696d84201d85c000b532a98'),
              new ObjectId('6696d86201d85c000b533aa9'),
              new ObjectId('66983879b6e411bcaa957dc4'),
            ],
          },
          {
            name: 'Trần Văn Quốc Thắng',
            email: 'comehere.thang@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Nha Trang',
            CCCD: '056202011199',
            note: 'Công Đoàn Trường ĐHCNSG',
            permissions: [
              new ObjectId('648ab6e7fa16b294212e4038'), //Xem thông tin chi tiết thành viên
              new ObjectId('648ab719fa16b294212e4042'), //Cập nhật thông tin thành viên
              new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
              new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
              new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
            ],
          },
          {
            name: 'Lại Văn Toàn',
            email: 'dh52006741@student.stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-03-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Huế',
            CCCD: '046202003204',
            note: 'Công Đoàn Trường ĐHCNSG',
            permissions: [
              new ObjectId('648ab6e7fa16b294212e4038'), //Xem thông tin chi tiết thành viên
              new ObjectId('648ab719fa16b294212e4042'), //Cập nhật thông tin thành viên
              new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
              new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
              new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
            ],
          },
        ]);
      }

      if (countUnionist === 0) {
        await this.unionistModel.insertMany([
          {
            name: 'UNIONIST',
            email: 'unionist@stu.id.vn',
            password: this.unionistService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Nha Trang',
            CCCD: '056202011199',
            note: 'Công Đoàn Trường ĐHCNSG',
            joiningDate: '2002-10-29T00:00:00.00+00:00',
            leavingDate: '2002-10-29T00:00:00.00+00:00',
            unionEntryDate: '2002-10-29T00:00:00.00+00:00',
            permissions: [
              new ObjectId('666f3672d8d4bd537d4407ef'), //Xem thông tin chi tiết công đoàn viên
              new ObjectId('666f3680006c1579a34d5ec2'), //Cập nhật thông tin công đoàn viên
              new ObjectId('6694cc16fda6b0a670cd3e42'), //Gửi yêu cầu thay đổi email
              new ObjectId('6694cc7cfda6b0a670cd3e4b'), //Xác nhận thay đổi email
              new ObjectId('6694cc9d047108a8053a8cce'), //Thay đổi mật khẩu
            ],
          },
        ]);
      }

      if (countUser > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
