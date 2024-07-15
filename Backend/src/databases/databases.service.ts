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
    private unionistService: UsersService,
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
            dateOfBirth: null,
            gender: null,
            address: null,
            CCCD: null,
            note: null,
            permissions: [
              new ObjectId('6694902bda1f6560724cb094'), // Fix the syntax error by removing the curly braces
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
              new ObjectId('648ab728fa16b294212e4047'),
              new ObjectId('6666f065aad2dbd0e9041226'),
              new ObjectId('6688dfd0a9b3d97d1b368c44'),
              new ObjectId('66890545d40c708b15d2f329'),
              new ObjectId('668b84dce8720bbbd18c7e77'),
              new ObjectId('66943bdd23978c1c8958970e'),
              new ObjectId('666f366d683cf1b5e2c9b7f9'),
              new ObjectId('666f3672d8d4bd537d4407ef'),
              new ObjectId('666f3679fdee1d528c846ebe'),
              new ObjectId('666f3680006c1579a34d5ec2'),
              new ObjectId('666f3686b8bab8c9aef4c495'),
              new ObjectId('666f368c80d7a70fa93fd90e'),
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
              new ObjectId('648ad56ddafdb9754f40b87c'),
              new ObjectId('6666f037cea8012c358bae9e'),
              new ObjectId('6684fc817e6150f6975463aa'),
              new ObjectId('648ad59adafdb9754f40b881'),
              new ObjectId('648ad5aedafdb9754f40b886'),
              new ObjectId('648ad5c5dafdb9754f40b88b'),
              new ObjectId('648ad5d4dafdb9754f40b890'),
              new ObjectId('648ad5ebdafdb9754f40b895'),
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
            note: 'Saigon Technology University',
            permissions: [],
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
            note: 'Saigon Technology University',
            permissions: [],
          },
          {
            name: 'Trần Nguyễn Thanh Sang',
            email: 'dh52007102@student.stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-07-17T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Nha Trang',
            CCCD: '056202007313',
            note: 'Saigon Technology University',
            permissions: [],
          },
          {
            name: 'Trần A Huy',
            email: 'dh52007056@student.stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-07-24T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Đồng Nai',
            CCCD: '080202004633',
            note: 'Saigon Technology University',
            permissions: [],
          },
        ]);
      }

      if (countUnionist === 0) {
        await this.unionistModel.insertMany([
          {
            name: 'Unionist',
            email: 'unionist@stu.id.vn',
            password: this.unionistService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: null,
            gender: null,
            address: null,
            CCCD: null,
            joiningDate: null,
            leavingDate: null,
            unionEntryDate: null,
            note: null,
            permissions: [],
          },
        ]);
      }

      if (countUser > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
