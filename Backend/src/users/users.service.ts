/* eslint-disable prefer-const */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from 'src/users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserPermissionsDto } from 'src/users/dto/update-user-permissions';
import { ObjectId } from 'mongodb'; // Import the ObjectId class from the 'mongodb' module
import * as xlsx from 'xlsx';
import { parse, formatISO } from 'date-fns';
import { UnionistsService } from 'src/unionists/unionists.service';
import { UpdateInfoUserDto } from 'src/users/dto/update-user-info.dto';
import { convertPhoneNumberToInternationalFormat } from '../util/utils';
import {
  decrypt,
  encrypt,
  isValidDateOfBirth,
  isValidEmail,
} from 'src/util/utils';
import { ZnssService } from 'src/znss/znss.service';
@Injectable()
export class UsersService {
  private readonly encryptionKey: Buffer;
  private readonly ivLength: number = 16; // Đảm bảo ivLength là số
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @Inject(forwardRef(() => UnionistsService))
    private readonly unionistsService: UnionistsService,
    private readonly mailerService: MailerService,
    private readonly znssService: ZnssService,
    private configService: ConfigService,
  ) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new Error(
        'Độ dài ENCRYPTION_KEY không hợp lệ. Nó phải dài 64 ký tự (32 byte)',
      );
    }
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    let {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      CCCD,
      note,
    } = createUserDto;

    // Convert email to lowercase
    email = email.toLowerCase();

    //logic check email exist
    const isExist = await this.userModel.findOne({ email });
    if (isExist)
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      permissions: [
        new ObjectId('648ab6e7fa16b294212e4038'), //Xem thông tin chi tiết thành viên
        new ObjectId('66b45ddc19284769298415e9'), //Thành viên cập nhật thông tin
        new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
        new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
        new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
      ],
      phoneNumber,
      CCCD,
      note,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUser;
  }

  async register(user: RegisterUserDto) {
    let { name, email, password, dateOfBirth, gender } = user;

    // Convert email to lowercase
    email = email.toLowerCase();

    if (!isValidEmail(email)) {
      throw new BadRequestException('Email phải có đuôi @stu.id.vn');
    }

    //logic check email exist
    const isExistUser = await this.userModel.findOne({ email });
    const isExistUnionist = await this.unionistsService.findOneByUserName(
      email,
    );

    if (isExistUser || isExistUnionist)
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      phoneNumber: null,
      note: null,
      permissions: [
        new ObjectId('648ab6e7fa16b294212e4038'), //Xem thông tin chi tiết thành viên
        new ObjectId('66b45ddc19284769298415e9'), //Thành viên cập nhật thông tin
        new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
        new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
        new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
      ],
    });

    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, //tổng số bản ghi
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    const user = await this.userModel
      .findOne({
        //_id: id,
        _id: id,
      })
      .select('-password') //không trả về password
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });
    return user;
  }

  async findUserNameWithUserId(id: string) {
    const userIdRegex = /^STU\d{5}$/;
    if (!userIdRegex.test(id))
      throw new BadRequestException('ID không hợp lệ!');

    const user = await this.userModel
      .findOne({
        id: id,
      })
      .select('name'); //trả về name

    return user;
  }

  private async findOneWithPassword(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    const user = await this.userModel
      .findOne({
        _id: id,
      })
      .select('password');
    return user;
  }

  async findOneByUserName(username: string) {
    const user = await this.userModel.findOne({
      email: username,
    });
    return user;
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async update(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
    //logic check email exist
    let { email } = updateUserDto;
    const currentEmail = await this.userModel.findOne({ _id });
    // Convert email to lowercase
    email = email.toLowerCase();

    if (email !== currentEmail.email) {
      const isExistUser = await this.userModel.findOne({ email });
      const isExistUnionist = await this.unionistsService.findOneByUserName(
        email,
      );
      if (isExistUser || isExistUnionist)
        throw new BadRequestException(
          `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
        );
    }

    const updated = await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async updateInfo(
    _id: string,
    updateInfoUserDto: UpdateInfoUserDto,
    user: IUser,
  ) {
    let { email } = updateInfoUserDto;

    const currentEmail = await this.userModel.findOne({ _id });
    // Convert email to lowercase
    email = email.toLowerCase();

    if (email !== currentEmail.email) {
      const isExistUser = await this.userModel.findOne({ email });
      const isExistUnionist = await this.unionistsService.findOneByUserName(
        email,
      );
      if (isExistUser || isExistUnionist)
        throw new BadRequestException(
          `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
        );
    }

    const updated = await this.userModel.updateOne(
      {
        _id: updateInfoUserDto._id,
      },
      {
        ...updateInfoUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async updateUserPermissions(
    _id: string,
    updateUserPermissionsDto: UpdateUserPermissionsDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ!');

    const { permissions } = updateUserPermissionsDto;

    const updated = await this.userModel.updateOne(
      { _id },
      {
        permissions,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    // const receipts = await this.receiptService.findReceiptsByUserId(id);

    // if (receipts.length > 0) {
    //   throw new BadRequestException(
    //     'Không thể xoá thành viên vì vẫn còn phiếu thu liên kết',
    //   );
    // }

    const foundUser = await this.userModel.findById(id);
    if (
      foundUser &&
      foundUser.email === this.configService.get<string>('EMAIL_ADMIN')
    )
      throw new BadRequestException('Không thể xóa tài khoản Admin');

    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.userModel.softDelete({
      _id: id,
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({
      refreshToken,
    });
  };

  async countUsers() {
    return await this.userModel.countDocuments({ isDeleted: false });
  }

  async requestChangeEmail(userId: string, newEmail: string, user: IUser) {
    // Validate new email format
    if (!isValidEmail(newEmail)) {
      throw new BadRequestException('Email phải có đuôi @stu.id.vn');
    }

    const isExist = await this.userModel.findOne({ email: newEmail });
    const isExistUnionist = await this.unionistsService.findOneByUserName(
      newEmail,
    );
    if (isExist || isExistUnionist) {
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
      );
    }

    if (!newEmail) {
      throw new BadRequestException(`Email mới không được để trống`);
    }

    const uuid = uuidv4().replace(/-/g, '');
    const verificationCode = uuid.slice(0, 5);
    const verificationExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 phút

    const result = await this.userModel.updateOne(
      { _id: userId },
      {
        verificationCode,
        verificationExpires,
      },
    );

    // Encrypt new email
    const encryptedNewEmail = encrypt(
      newEmail,
      this.ivLength,
      this.encryptionKey,
    );

    // Lấy email hiện tại từ cơ sở dữ liệu
    const currentUser = await this.userModel.findById(userId).select('email');

    // Send confirmation email to current email
    await this.sendChangeEmailConfirmationEmail(
      currentUser.email,
      encryptedNewEmail,
      verificationCode,
      user,
    );

    return result;
  }

  async sendChangeEmailConfirmationEmail(
    email: string,
    encryptedNewEmail: string,
    verificationCode: string,
    user: IUser,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: '"Công Đoàn Trường ĐHCNSG" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Thay Đổi Email',
      template: 'change-mail',
      context: {
        receiver: user.name,
        verificationCode,
        url: `${this.configService.get<string>(
          'FRONTEND_URL_PROD',
        )}/confirm-change-email/${user._id}?newEmail=${encryptedNewEmail}`,
      },
    });
  }

  async confirmChangeEmail(
    userId: string,
    verificationCode: string,
    encryptedNewEmail: string,
  ) {
    // Decrypt email mới
    const newEmail = decrypt(encryptedNewEmail, this.encryptionKey);

    // Kiểm tra định dạng email mới
    if (!isValidEmail(newEmail)) {
      throw new BadRequestException('Email phải có đuôi @stu.id.vn');
    }

    // Tìm kiếm user theo userId và verificationCode
    const findUser = await this.userModel.findOne({
      _id: userId,
      verificationCode,
      verificationExpires: { $gt: new Date() }, // verificationCode phải hợp lệ
    });

    if (!findUser) {
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật email và xóa verificationCode, verificationExpires
    await this.userModel.findByIdAndUpdate(userId, {
      email: newEmail,
      $unset: {
        verificationCode: 1,
        verificationExpires: 1,
      },
    });

    return newEmail;
  }

  async requestForgotPassword(email: string) {
    // Validate email format
    if (email && !isValidEmail(email)) {
      throw new BadRequestException('Email không hợp lệ');
    }

    const isExist = await this.userModel.findOne({ email: email });

    if (!isExist) {
      throw new BadRequestException(
        `Email không tồn tại trên hệ thống. Vui lòng thử lại với email khác`,
      );
    }

    // tạo mã xác nhận và thời gian hết hạn
    const uuid = uuidv4().replace(/-/g, '');
    const verificationCodePassword = uuid.slice(0, 5);
    const verificationExpiresPassword = new Date(Date.now() + 20 * 60 * 1000); // 20 phút

    let result = null;

    if (isExist) {
      result = await this.userModel.updateOne(
        { email: email },
        {
          verificationCodePassword,
          verificationExpiresPassword,
        },
      );
    }

    // Lấy email hiện tại từ cơ sở dữ liệu
    const currentUserEmail = isExist.email;

    // Chuyển đổi số điện thoại từ định dạng nội địa sang quốc tế
    if (isExist.phoneNumber) {
      const formattedPhoneNumber = convertPhoneNumberToInternationalFormat(
        isExist.phoneNumber,
      );
      const res = await this.znssService.sendNotification(
        formattedPhoneNumber,
        verificationCodePassword,
      );
      if (res && res.error === -124) {
        await this.znssService.getNewAccessToken();
        const res = await this.znssService.sendNotification(
          formattedPhoneNumber,
          verificationCodePassword,
        );
        console.log('Gửi lại ZNS', res);
      } else {
        console.log('Gửi ZNS', res);
      }
    }

    // Send confirmation email to current email
    await this.sendForgotPasswordConfirmationEmail(
      currentUserEmail,
      verificationCodePassword,
    );

    return { _id: isExist._id, result };
  }

  async sendForgotPasswordConfirmationEmail(
    email: string,
    verificationCodePassword: string,
  ) {
    const currentUser = await this.userModel.findOne({ email: email });

    await this.mailerService.sendMail({
      to: email,
      from: '"Công Đoàn Trường ĐHCNSG" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Đặt Lại Mật Khẩu',
      template: 'forgot-password',
      context: {
        receiver: currentUser.name,
        verificationCodePassword,
        url: `${this.configService.get<string>(
          'FRONTEND_URL_PROD',
        )}/confirm-forgot-password/${currentUser._id}`,
      },
    });
  }

  async confirmForgotPassword(
    id: string,
    verificationCodePassword: string,
    newPassword: string,
  ) {
    // Kiểm tra định dạng mật khẩu mới
    if (!newPassword) {
      throw new BadRequestException('Mật khẩu mới không hợp lệ');
    }

    if (
      !(
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword) &&
        newPassword.length >= 8
      )
    ) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
      );
    }

    // Tìm kiếm user theo userId và verificationCodePassword
    const findUser = await this.userModel.findOne({
      _id: id,
      verificationCodePassword,
      verificationExpiresPassword: { $gt: new Date() }, // verificationCode phải hợp lệ
    });

    if (!findUser) {
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật password và xóa verificationCodePassword, verificationExpiresPassword
    const result = await this.userModel.findOneAndUpdate(
      { _id: id },
      {
        password: this.getHashPassword(newPassword),
        $unset: {
          verificationCodePassword: 1,
          verificationExpiresPassword: 1,
        },
      },
    );

    return result;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const foundUser = await this.findOneWithPassword(id);
    if (!foundUser) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const isCurrentPasswordValid = await this.verifyPassword(
      currentPassword,
      foundUser.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    foundUser.password = await this.getHashPassword(newPassword);
    await foundUser.save();

    return true;
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async uploadFile(file: Express.Multer.File, user: IUser) {
    // Kiểm tra xem file có tồn tại không
    if (!file) {
      throw new BadRequestException('Không tìm thấy file để nhập dữ liệu');
    }

    // Kiểm tra loại file
    const allowedTypes = [
      'application/vnd.ms-excel', // for .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // for .xlsx
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ cho phép nhập từ file Excel');
    }

    // Đọc dữ liệu từ file Excel
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
    });

    const totalRowsRead = data.length - 1; // Trừ đi hàng đầu tiên là header

    const invalidRows = [];
    const emailChecks = [];

    // Lọc bỏ các dòng rỗng và kiểm tra dữ liệu hợp lệ
    const filteredData = data.slice(1).filter(async (row, index) => {
      // Kiểm tra dòng có đủ các cột cần thiết không
      if ((row as any[]).length < 8) {
        // Cần ít nhất 8 cột
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      let userEmail = row[0];
      const userName = row[1];
      const userGender = row[2];
      const userBirthday = row[3];
      const userPhoneNumber = row[4] || null;
      const userCCCD = row[5] || null;
      const userAddress = row[6] || null;
      const userNote = row[7] || null;

      // Kiểm tra các giá trị cần thiết
      if (!userEmail || !userName || !userGender || !userBirthday) {
        invalidRows.push(index + 2);
        return false;
      }

      // Convert email to lowercase
      userEmail = userEmail.toLowerCase();

      // Kiểm tra email
      if (!isValidEmail(userEmail)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra giới tính
      if (
        userGender !== 'MALE' &&
        userGender !== 'FEMALE' &&
        userGender !== 'OTHER'
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      if (!isValidDateOfBirth(userBirthday)) {
        invalidRows.push(index + 2);
        return false;
      }

      if (userName.length > 30) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra số điện thoại nếu có
      if (
        userPhoneNumber &&
        !/^(03|05|07|08|09)[0-9]{8}$/.test(userPhoneNumber)
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra CCCD nếu có
      if (userCCCD && !/^\d{12}$/.test(userCCCD)) {
        invalidRows.push(index + 2);
        return false;
      }

      if (userNote && userNote.length > 50) {
        invalidRows.push(index + 2);
        return false;
      }

      if (userAddress && userAddress.length > 150) {
        invalidRows.push(index + 2);
        return false;
      }

      emailChecks.push(this.userModel.findOne({ email: userEmail }));
      emailChecks.push(this.unionistsService.findOneByUserName(userEmail));

      return true;
    });

    // Số dòng hợp lệ
    const validRowsCount = filteredData.length;

    // Kiểm tra email
    const emailResults = await Promise.all(emailChecks);
    const emailSet = new Set();

    emailResults.forEach((result) => {
      if (result) {
        emailSet.add(result.email);
      }
    });

    const existingEmails = new Set();
    filteredData.forEach((row) => {
      const email = row[0].toLowerCase();
      if (emailSet.has(email)) {
        existingEmails.add(email);
      }
    });

    if (filteredData.length === 0 && invalidRows.length > 0) {
      throw new BadRequestException(
        'Dữ liệu không hợp lệ. Xin hãy kiểm tra lại quy tắc nhập liệu',
      );
    }
    if (existingEmails.size > 0) {
      throw new BadRequestException(
        'Dữ liệu bị trùng lặp. Xin hãy kiểm tra lại',
      );
    }

    // Lưu dữ liệu vào cơ sở dữ liệu
    for (const row of filteredData) {
      let userEmail = row[0];
      const userName = row[1];
      const userGender = row[2];
      const userBirthday = row[3];
      const userPhoneNumber = row[4] || null;
      const userCCCD = row[5] || null;
      const userAddress = row[6] || null;
      const userNote = row[7] || null;

      // Convert email to lowercase
      userEmail = userEmail.toLowerCase();

      const [day, month, year] = userBirthday.split('/');
      const parsedDate = parse(
        `${day}/${month}/${year}`,
        'dd/MM/yyyy',
        new Date(),
      );
      const formattedDate = formatISO(parsedDate);
      try {
        // Tạo mới bản ghi user
        await this.userModel.create({
          name: userName,
          password: this.getHashPassword(
            this.configService.get<string>('INIT_PASSWORD'),
          ),
          email: userEmail,
          gender: userGender,
          dateOfBirth: formattedDate,
          phoneNumber: userPhoneNumber,
          CCCD: userCCCD,
          address: userAddress,
          note: userNote,
          permissions: [
            new ObjectId('648ab6e7fa16b294212e4038'), // Xem thông tin chi tiết thành viên
            new ObjectId('66b45ddc19284769298415e9'), // Thành viên cập nhật thông tin
            new ObjectId('6688dfd0a9b3d97d1b368c44'), // Gửi yêu cầu thay đổi email
            new ObjectId('66890545d40c708b15d2f329'), // Xác nhận thay đổi email
            new ObjectId('668b84dce8720bbbd18c7e77'), // Thay đổi mật khẩu
          ],
          createdBy: {
            _id: user._id,
            email: user.email,
          },
        });
      } catch (error) {
        throw new BadRequestException(`Lỗi khi lưu dữ liệu: ${error.message}`);
      }
    }

    return {
      message: 'Nhập dữ liệu từ file excel thành công',
      totalRowsRead,
      validRowsCount,
    };
  }
}
