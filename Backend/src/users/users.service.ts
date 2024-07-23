/* eslint-disable prettier/prettier */
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
import mongoose from 'mongoose';
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
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';
import { UpdateUserPermissionsDto } from 'src/users/dto/update-user-permissions';
import { ObjectId } from 'mongodb'; // Import the ObjectId class from the 'mongodb' module
import * as xlsx from 'xlsx';
import { parse, formatISO } from 'date-fns';
import { UnionistsService } from 'src/unionists/unionists.service';
import { isValidDateOfBirth } from 'src/util/utils';
import dayjs from 'dayjs';
@Injectable()
export class UsersService {
  private readonly encryptionKey: Buffer;
  private readonly ivLength: number = 16; // Đảm bảo ivLength là số
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @Inject(forwardRef(() => UnionistsService))
    private readonly unionistsService: UnionistsService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
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
    const { name, email, password, dateOfBirth, gender, address, CCCD, note } =
      createUserDto;

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Email mới không hợp lệ');
    }

    //logic check email exist
    const isExist = await this.userModel.findOne({ email });
    if (isExist)
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    if (
      !(
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        password.length >= 8
      )
    ) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
      );
    }

    if (!isValidDateOfBirth(dateOfBirth)) {
      throw new BadRequestException(
        'Ngày sinh không hợp lệ hoặc chưa đủ 18 tuổi',
      );
    }

    if (
      gender &&
      gender !== 'MALE' &&
      gender !== 'FEMALE' &&
      gender !== 'OTHER'
    ) {
      throw new BadRequestException('Giới tính không hợp lệ');
    }

    if (address && address.length > 50) {
      throw new BadRequestException('Địa chỉ không được vượt quá 50 ký tự');
    }

    if (CCCD && !/^\d{12}$/.test(CCCD)) {
      throw new BadRequestException('CCCD không hợp lệ');
    }

    if (note && note.length > 30) {
      throw new BadRequestException('Ghi chú không được vượt quá 30 ký tự');
    }

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
        new ObjectId('648ab719fa16b294212e4042'), //Cập nhật thông tin thành viên
        new ObjectId('6688dfd0a9b3d97d1b368c44'), //Gửi yêu cầu thay đổi email
        new ObjectId('66890545d40c708b15d2f329'), //Xác nhận thay đổi email
        new ObjectId('668b84dce8720bbbd18c7e77'), //Thay đổi mật khẩu
      ],
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
    const { name, email, password, dateOfBirth, gender, address } = user;

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Email mới không hợp lệ');
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

    if (
      !(
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        password.length >= 8
      )
    ) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
      );
    }

    if (!isValidDateOfBirth(dateOfBirth)) {
      throw new BadRequestException(
        'Ngày sinh không hợp lệ hoặc chưa đủ 18 tuổi',
      );
    }

    if (
      gender &&
      gender !== 'MALE' &&
      gender !== 'FEMALE' &&
      gender !== 'OTHER'
    ) {
      throw new BadRequestException('Giới tính không hợp lệ');
    }

    if (address && address.length > 50) {
      throw new BadRequestException('Địa chỉ không được vượt quá 50 ký tự');
    }

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      note: '',
      permissions: [
        new ObjectId('648ab6e7fa16b294212e4038'), //Xem thông tin chi tiết thành viên
        new ObjectId('648ab719fa16b294212e4042'), //Cập nhật thông tin thành viên
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    return this.userModel
      .findOne({
        _id: id,
      })
      .select('-password') //không trả về password
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });
  }

  private findOneWithPassword(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    return this.userModel
      .findOne({
        _id: id,
      })
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async update(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
    //logic check email exist
    const { email, dateOfBirth, gender, address, CCCD, note } = updateUserDto;
    const currentEmail = await this.userModel.findOne({ _id });

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

    if (!isValidDateOfBirth(dateOfBirth)) {
      throw new BadRequestException(
        'Ngày sinh không hợp lệ hoặc chưa đủ 18 tuổi',
      );
    }

    if (
      gender &&
      gender !== 'MALE' &&
      gender !== 'FEMALE' &&
      gender !== 'OTHER'
    ) {
      throw new BadRequestException('Giới tính không hợp lệ');
    }

    if (address && address.length > 50) {
      throw new BadRequestException('Địa chỉ không được vượt quá 50 ký tự');
    }

    if (CCCD && !/^\d{12}$/.test(CCCD)) {
      throw new BadRequestException('CCCD không hợp lệ');
    }

    if (note && note.length > 30) {
      throw new BadRequestException('Ghi chú không được vượt quá 30 ký tự');
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
    if (!mongoose.Types.ObjectId.isValid(id)) return `ID không hợp lệ`;

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

  private encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  async requestChangeEmail(userId: string, newEmail: string, user: IUser) {
    // Validate new email format
    if (!this.isValidEmail(newEmail)) {
      throw new BadRequestException('Email mới không hợp lệ');
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
    const encryptedNewEmail = this.encrypt(newEmail);

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
      from: '"Saigon Technology University" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Thay Đổi Email',
      template: 'change-mail',
      context: {
        receiver: user.name,
        verificationCode,
        url: `${this.configService.get<string>(
          'FRONTEND_URL',
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
    const newEmail = this.decrypt(encryptedNewEmail);

    // Kiểm tra định dạng email mới
    if (!this.isValidEmail(newEmail)) {
      throw new BadRequestException('Email mới không hợp lệ');
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    if (
      !(
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /\d/.test(newPassword) &&
        newPassword.length >= 8
      )
    ) {
      throw new BadRequestException(
        'Mật khẩu mới phải có ít nhất một ký tự thường, một ký tự hoa, một số và có độ dài tối thiểu là 8 ký tự',
      );
    }

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
      throw new BadRequestException('Không tìm thấy file để tải lên');
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

    // Lọc bỏ các dòng rỗng và kiểm tra dữ liệu hợp lệ
    const filteredData = data.slice(1).filter((row, index) => {
      // Kiểm tra dòng có đủ các cột cần thiết không
      if ((row as any[]).length < 8) {
        // Cần ít nhất 8 cột
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      const userId = row[0];
      const userEmail = row[1];
      const userName = row[2];
      const userGender = row[3];
      const userBirthday = row[4];
      const userCCCD = row[5] || null;
      const userAddress = row[6];

      // Kiểm tra các giá trị cần thiết
      if (
        !userId ||
        !userName ||
        !userGender ||
        !userBirthday ||
        !userAddress
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra email
      if (!this.isValidEmail(userEmail)) {
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

      // Kiểm tra ngày sinh
      const dayMonthYearRegex =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dayMonthYearRegex.test(userBirthday)) {
        invalidRows.push(index + 2);
        return false;
      }

      const [day, month, year] = userBirthday.split('/').map(Number);
      // Kiểm tra năm sinh không nhỏ hơn 1900
      if (year < 1900) {
        invalidRows.push(index + 2);
        return false;
      }

      const isValidDate = (
        day: number,
        month: number,
        year: number,
      ): boolean => {
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      };

      if (!isValidDate(day, month, year)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra tuổi
      const dateOfBirth = dayjs(new Date(year, month - 1, day));
      const today = dayjs();
      const age = today.diff(dateOfBirth, 'year');
      if (age < 18) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra CCCD nếu có
      if (userCCCD && !/^\d{12}$/.test(userCCCD)) {
        invalidRows.push(index + 2);
        return false;
      }

      return true;
    });

    // Số dòng hợp lệ
    const validRowsCount = filteredData.length;

    if (filteredData.length === 0) {
      throw new BadRequestException('Không có dữ liệu hợp lệ trong file');
    } else if (invalidRows.length > 0) {
      throw new BadRequestException(
        `Dữ liệu không hợp lệ ở các dòng: ${invalidRows.join(', ')}`,
      );
    }

    // Lưu dữ liệu vào cơ sở dữ liệu
    for (const row of filteredData) {
      const userId = row[0];
      const userEmail = row[1];
      const userName = row[2];
      const userGender = row[3];
      const userBirthday = row[4];
      const userCCCD = row[5] || null;
      const userAddress = row[6];
      const userNote = row[7] || null;

      const [day, month, year] = userBirthday.split('/');
      const parsedDate = parse(
        `${day}/${month}/${year}`,
        'dd/MM/yyyy',
        new Date(),
      );
      const formattedDate = formatISO(parsedDate);

      try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const existingUser = await this.userModel.findOne({
          _id: userId,
          name: userName,
          email: userEmail,
        });

        const isExistUnionist = await this.unionistsService.findOneByUserName(
          userEmail,
        );

        if (existingUser || isExistUnionist) {
          throw new BadRequestException(
            `Thành viên ${userName} với email ${userEmail} đã tồn tại`,
          );
        }

        // Tạo mới bản ghi user
        await this.userModel.create({
          _id: userId,
          name: userName,
          password: this.getHashPassword(
            this.configService.get<string>('INIT_PASSWORD'),
          ),
          email: userEmail,
          gender: userGender,
          dateOfBirth: formattedDate,
          CCCD: userCCCD,
          address: userAddress,
          note: userNote,
          permissions: [
            new ObjectId('648ab6e7fa16b294212e4038'), // Xem thông tin chi tiết thành viên
            new ObjectId('648ab719fa16b294212e4042'), // Cập nhật thông tin thành viên
            new ObjectId('6688dfd0a9b3d97d1b368c44'), // Gửi yêu cầu thay đổi email
            new ObjectId('66890545d40c708b15d2f329'), // Xác nhận thay đổi email
            new ObjectId('668b84dce8720bbbd18c7e77'), // Thay đổi mật khẩu
          ],
          createdBy: {
            _id: user._id,
            email: user.email,
          },
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        throw new BadRequestException(`Lỗi khi lưu dữ liệu: ${error.message}`);
      }
    }

    return {
      message: 'Tải file lên thành công',
      totalRowsRead,
      validRowsCount,
    };
  }
}
