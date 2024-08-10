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
            id: 'STU00001',
            name: 'ADMIN',
            email: 'admin@stu.edu.vn',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            dateOfBirth: '2002-10-29T00:00:00.00+00:00',
            gender: 'MALE',
            address: 'Nha Trang',
            CCCD: '056202011199',
            note: 'ADMIN',
            permissions: [
              new ObjectId('6694902bda1f6560724cb094'), // truy cập trang quản trị
              new ObjectId('66a1eaa3af5212c607f12b13'), // truy cập trang thống kê
              new ObjectId('648ad59adafdb9754f40b881'), // tạo mới quyền hạn
              new ObjectId('648ad5aedafdb9754f40b886'), // xem danh sách quyền hạn
              new ObjectId('648ad5c5dafdb9754f40b88b'), // xem thông tin chi tiết quyền hạn
              new ObjectId('648ad5d4dafdb9754f40b890'), // cập nhật thông tin quyền hạn
              new ObjectId('648ad5ebdafdb9754f40b895'), // xoá quyền hạn
              new ObjectId('648ab415f4328bd3153ee211'), // xem danh sách đơn vị
              new ObjectId('648ab436f4328bd3153ee216'), // thêm mới đơn vị
              new ObjectId('648ab4d5f4328bd3153ee21b'), // cập nhật thông tin đơn vị
              new ObjectId('648ab4ebf4328bd3153ee220'), // xoá đơn vị
              new ObjectId('648ab5a8072f2a2ef910638d'), // xem thông tin chi tiết đơn vị
              new ObjectId('6666f05b38171eb82790369c'), // xem số lượng đơn vị
              new ObjectId('648ab6d3fa16b294212e4033'), // thêm mới thành viên
              new ObjectId('648ab6e7fa16b294212e4038'), // xem thông tin chi tiết thành viên
              new ObjectId('648ab6fdfa16b294212e403d'), // xem danh sách thành viên
              new ObjectId('648ab719fa16b294212e4042'), // cập nhật thông tin thành viên
              new ObjectId('66b45ddc19284769298415e9'), // thành viên cập nhật thông tin
              new ObjectId('66943bdd23978c1c8958970e'), // cập nhật quyền hạn thành viên
              new ObjectId('648ab728fa16b294212e4047'), // xoá thành viên
              new ObjectId('6697de58af6aeefbf633abf1'), // tải lên danh sách thành viên
              new ObjectId('6666f065aad2dbd0e9041226'), // xem số lượng thành viên
              new ObjectId('6688dfd0a9b3d97d1b368c44'), // gửi yêu cầu thay đổi email
              new ObjectId('66890545d40c708b15d2f329'), // xác nhận thay đổi email
              new ObjectId('668b84dce8720bbbd18c7e77'), // thay đổi mật khẩu
              new ObjectId('666f366d683cf1b5e2c9b7f9'), // thêm mới công đoàn viên
              new ObjectId('666f3672d8d4bd537d4407ef'), // xem thông tin chi tiết công đoàn viên
              new ObjectId('666f3679fdee1d528c846ebe'), // xem danh sách công đoàn viên
              new ObjectId('666f3680006c1579a34d5ec2'), // cập nhật thông tin công đoàn viên
              new ObjectId('66b45770a24d3fc3d850430c'), // công đoàn viên cập nhật thông tin
              new ObjectId('666f3686b8bab8c9aef4c495'), // xoá công đoàn viên
              new ObjectId('6697ee9673975ad0a88c668e'), // tải lên danh sách công đoàn viên
              new ObjectId('666f368c80d7a70fa93fd90e'), // xem số lượng công đoàn viên
              new ObjectId('6694cbb68cc60924a765f673'), // cập nhật quyền hạn công đoàn viên
              new ObjectId('6694cc16fda6b0a670cd3e42'), // gửi yêu cầu thay đổi email
              new ObjectId('6694cc7cfda6b0a670cd3e4b'), // xác nhận thay đổi email
              new ObjectId('6694cc9d047108a8053a8cce'), // thay đổi mật khẩu
              new ObjectId('648ab750fa16b294212e404c'), // Upload file
              new ObjectId('648ad488dafdb9754f40b846'), // thêm mới bài đăng
              new ObjectId('648ad4a6dafdb9754f40b850'), // cập nhật thông tin bài đăng
              new ObjectId('66a1e2040e45e02baa2a89dd'), // cập nhật trạng thái bài đăng
              new ObjectId('648ad4ccdafdb9754f40b859'), // xem danh sách bài đăng
              new ObjectId('648ad4d9dafdb9754f40b85e'), // xoá bài đăng
              new ObjectId('6666f06b3254c2be902bfe5e'), // xem số lượng bài đăng
              new ObjectId('648ad4fedafdb9754f40b863'), // tạo mới văn bản
              new ObjectId('648ad511dafdb9754f40b868'), // xem danh sách văn bản
              new ObjectId('648ad522dafdb9754f40b86d'), // xem thông tin chi tiết văn bản
              new ObjectId('648ad53bdafdb9754f40b872'), // xoá văn bản
              new ObjectId('648ad555dafdb9754f40b877'), // cập nhật trạng thái văn bản
              new ObjectId('6684fc817e6150f6975463aa'), // cập nhật tên văn bản
              new ObjectId('648ad56ddafdb9754f40b87c'), // xem danh sách văn bản theo thành viên
              new ObjectId('6666f037cea8012c358bae9e'), // xem số lượng văn bản
              new ObjectId('669659a0c5d4e84cd7515859'), // tạo mới công đoàn phí
              new ObjectId('66965b6286e8a509567a218e'), // xem danh sách công đoàn phí
              new ObjectId('66a5e5a406d2f0606ea29bae'), // lấy thông tin đóng công đoàn phí theo công đoàn viên
              new ObjectId('66965e152d2ec3b0bfc03595'), // xem thông tin chi tiết công đoàn phí
              new ObjectId('66965e332d2ec3b0bfc0359e'), // cập nhật thông tin công đoàn phí
              new ObjectId('66968e1a0979f9a91572e2ff'), // xoá công đoàn phí
              new ObjectId('669718d20418310dcc6f2703'), // tải lên danh sách công đoàn phí
              new ObjectId('6696d059eb2b81a905bd3132'), // tạo mới phiếu thu
              new ObjectId('6696d084eb2b81a905bd313b'), // xem danh sách phiếu thu
              new ObjectId('66a7651f2beed38d9fd58878'), // lấy thông tin phiếu thu theo thời gian
              new ObjectId('6696d0b1eb2b81a905bd3144'), // xem thông tin chi tiết phiếu thu
              new ObjectId('6696d0f8eb2b81a905bd3155'), // cập nhật thông tin phiếu thu
              new ObjectId('6696d124eb2b81a905bd315e'), // xoá phiếu thu
              new ObjectId('66982ece2bec1e24eb383e7b'), // tải lên danh sách phiếu thu
              new ObjectId('66b06327f7e7667af5893c7c'), // xuất phiếu thu ra file pdf
              new ObjectId('6696d059eb2b81a911bd3132'), // tạo mới phiếu chi
              new ObjectId('6696d084eb2b81a912bd313b'), // xem danh sách phiếu chi
              new ObjectId('66a7653e2beed38d9fd58883'), // lấy thông tin phiếu chi theo thời gian
              new ObjectId('6696d0b1eb2b81a913bd3144'), // xem thông tin chi tiết phiếu chi
              new ObjectId('6696d0f8eb2b81a914bd3155'), // cập nhật thông tin phiếu chi
              new ObjectId('6696d124eb2b81a915bd315e'), // xoá phiếu chi
              new ObjectId('669833998a337a4d50aeb7f9'), // tải lên danh sách phiếu chi
              new ObjectId('66b06341f7e7667af5893c87'), // xuất phiếu chi ra file pdf
              new ObjectId('6696d7d601d85c000b573a7d'), // tạo mới danh mục thu
              new ObjectId('6696d7ff01d85c000b573a86'), // xem danh sách danh mục thu
              new ObjectId('66a7a0f074da797d021c8fa5'), // lấy thông tin danh mục thu theo thời gian
              new ObjectId('6696d82301d85c000b573a8f'), // xem thông tin chi tiết danh mục thu
              new ObjectId('6696d84201d85c000b573a98'), // cập nhật thông tin danh mục thu
              new ObjectId('6696d86201d85c000b573aa9'), // xoá danh mục thu
              new ObjectId('66983866b6e411bcaa957dbb'), // tải lên danh sách danh mục thu
              new ObjectId('6696d7d601d85c000b529a7d'), // tạo mới danh mục chi
              new ObjectId('6696d7ff01d85c000b530a86'), // xem danh sách danh mục chi
              new ObjectId('66a84674201f3104030b05a6'), // lấy thông tin danh mục chi theo thời gian
              new ObjectId('6696d82301d85c000b531a8f'), // xem thông tin chi tiết danh mục chi
              new ObjectId('6696d84201d85c000b532a98'), // cập nhật thông tin danh mục chi
              new ObjectId('6696d86201d85c000b533aa9'), // xoá danh mục chi
              new ObjectId('66983879b6e411bcaa957dc4'), // tải lên danh sách danh mục chi
            ],
          },
          {
            id: 'STU00002',
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
              new ObjectId('66b45ddc19284769298415e9'), //Thành viên cập nhật thông tin
              new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
              new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
              new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
            ],
          },
          {
            id: 'STU00003',
            name: 'Lại Văn Toàn',
            email: 'dh52006741@stu.edu.vn',
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
              new ObjectId('66b45ddc19284769298415e9'), //Thành viên cập nhật thông tin
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
            id: 'CD00001',
            name: 'UNIONIST',
            email: 'unionist@stu.edu.vn',
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
              new ObjectId('66b45770a24d3fc3d850430c'), //Công đoàn viên cập nhật thông tin
              new ObjectId('6694cc16fda6b0a670cd3e42'), //Gửi yêu cầu thay đổi email
              new ObjectId('6694cc7cfda6b0a670cd3e4b'), //Xác nhận thay đổi email
              new ObjectId('6694cc9d047108a8053a8cce'), //Thay đổi mật khẩu
              new ObjectId('66a5e5a406d2f0606ea29bae'), //Lấy thông tin đóng công đoàn phí
            ],
          },
        ]);
      }

      if (countUser > 0 && countUnionist > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
