import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from 'src/databases/sample';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countUser = await this.userModel.count({});
      const countPermission = await this.permissionModel.count({});
      const countRole = await this.roleModel.count({});

      //create permissions
      if (countPermission === 0)
        await this.permissionModel.insertMany(INIT_PERMISSIONS);

      //create role
      if (countRole === 0) {
        const permissions = await this.permissionModel.find({}).select('_id');
        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Quản trị viên',
            isActive: true,
            permissions: permissions, //full quyền
          },
          {
            name: USER_ROLE,
            description: 'Người dùng sử dụng hệ thống',
            isActive: true,
            permissions: [], //không set quyền, chỉ cần add role
          },
        ]);
      }

      if (countUser === 0) {
        const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });
        await this.userModel.insertMany([
          {
            name: 'Admin',
            email: 'admin@stu.id.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Saigon Technology University',
            role: adminRole?._id,
            CCCD: '056202011199',
            joiningDate: '1999-01-01T00:00:00.00+00:00',
            leavingDate: '1999-01-01T00:00:00.00+00:00',
            unionEntryDate: '1999-01-01T00:00:00.00+00:00',
          },
          {
            name: 'Trần Văn Quốc Thắng',
            email: 'comehere.thang@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Saigon Technology University',
            role: adminRole?._id,
            CCCD: '056202011199',
            joiningDate: '1999-01-01T00:00:00.00+00:00',
            leavingDate: '1999-01-01T00:00:00.00+00:00',
            unionEntryDate: '1999-01-01T00:00:00.00+00:00',
          },
          {
            name: 'Lại Văn Toàn',
            email: 'nadmat1205@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-03-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Saigon Technology University',
            role: adminRole?._id,
            CCCD: '046202003204',
            joiningDate: '1999-01-01T00:00:00.00+00:00',
            leavingDate: '1999-01-01T00:00:00.00+00:00',
            unionEntryDate: '1999-01-01T00:00:00.00+00:00',
          },
          {
            name: 'Trần Nguyễn Thanh Sang',
            email: 'dh52007102@student.stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-07-17T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Saigon Technology University',
            role: userRole?._id,
            CCCD: '056202007313',
            joiningDate: '1999-01-01T00:00:00.00+00:00',
            leavingDate: '1999-01-01T00:00:00.00+00:00',
            unionEntryDate: '1999-01-01T00:00:00.00+00:00',
          },
          {
            name: 'Trần A Huy',
            email: 'dh52007056@student.stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-07-24T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Saigon Technology University',
            role: userRole?._id,
            CCCD: '080202004633',
            joiningDate: '1999-01-01T00:00:00.00+00:00',
            leavingDate: '1999-01-01T00:00:00.00+00:00',
            unionEntryDate: '1999-01-01T00:00:00.00+00:00',
          },
        ]);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
