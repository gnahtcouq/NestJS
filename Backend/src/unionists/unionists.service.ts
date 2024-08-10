/* eslint-disable prefer-const */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUnionistDto } from './dto/create-unionist.dto';
import { UpdateUnionistDto } from './dto/update-unionist.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Unionist,
  UnionistDocument,
} from 'src/unionists/schemas/unionist.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/decorator/customize';
import { IUnionist } from 'src/unionists/unionists.interface';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { UpdateUnionistPermissionsDto } from 'src/unionists/dto/update-unionist-permissions';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ChangePasswordDto } from 'src/unionists/dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { IUser } from 'src/users/users.interface';
import * as xlsx from 'xlsx';
import { UsersService } from 'src/users/users.service';
import { UpdateInfoUnionistDto } from 'src/unionists/dto/update-unionist-info.dto';
import {
  convertToISODate,
  isValidDateOfBirth,
  isValidDateRange,
  isValidEmail,
} from 'src/util/utils';
import { isNull } from 'util';

@Injectable()
export class UnionistsService {
  private readonly encryptionKey: Buffer;
  private readonly ivLength: number = 16; // Đảm bảo ivLength là số
  constructor(
    @InjectModel(Unionist.name)
    private unionistModel: SoftDeleteModel<UnionistDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
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

  async create(createUnionistDto: CreateUnionistDto, @User() user: IUser) {
    let {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      CCCD,
      departmentId,
      joiningDate,
      leavingDate,
      unionEntryDate,
      note,
    } = createUnionistDto;

    // Convert email to lowercase
    email = email.toLowerCase();

    if (!isValidEmail(email)) {
      throw new BadRequestException('Email phải có đuôi @stu.edu.vn');
    }

    const isExistUnionist = await this.unionistModel.findOne({ email });
    const isExistUser = await this.usersService.findOneByUserName(email);

    if (isExistUser || isExistUnionist)
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    const hashPassword = this.getHashPassword(password);

    let newUnionist = await this.unionistModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      phoneNumber: phoneNumber ? phoneNumber : null,
      address: address ? address : null,
      permissions: [
        new ObjectId('666f3672d8d4bd537d4407ef'), //Xem thông tin chi tiết công đoàn viên
        new ObjectId('66b45770a24d3fc3d850430c'), //Công đoàn viên cập nhật thông tin
        new ObjectId('6694cc16fda6b0a670cd3e42'), //Gửi yêu cầu thay đổi email
        new ObjectId('6694cc7cfda6b0a670cd3e4b'), //Xác nhận thay đổi email
        new ObjectId('6694cc9d047108a8053a8cce'), //Thay đổi mật khẩu
        new ObjectId('66a5e5a406d2f0606ea29bae'), //Lấy thông tin đóng công đoàn phí
      ],
      CCCD: CCCD ? CCCD : null,
      departmentId: departmentId ? departmentId : null,
      joiningDate: joiningDate ? joiningDate : '1970-01-01',
      leavingDate: leavingDate ? leavingDate : '1970-01-01',
      unionEntryDate: unionEntryDate ? unionEntryDate : '1970-01-01',
      note: note ? note : null,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUnionist;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (filter.leaving) {
      if (filter.leaving == 1) {
        filter.leavingDate = '1970-01-01';
      } else if (filter.leaving == 2) {
        filter.leavingDate = { $ne: '1970-01-01' };
      }
      delete filter.leaving;
    }

    if (filter.year) {
      const year = filter.year;
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      filter.joiningDate = { $gte: startDate, $lte: endDate };
      delete filter.year;
    }

    // Xử lý khoảng thời gian từ tháng/năm đến tháng/năm cho joiningDate
    if (filter.joiningStartMonthYear && filter.joiningEndMonthYear) {
      const [startYear, startMonth] = filter.joiningStartMonthYear.split('/');
      const [endYear, endMonth] = filter.joiningEndMonthYear.split('/');

      const startDate = new Date(+startYear, +startMonth - 1, 1); // Ngày đầu tiên của tháng bắt đầu
      const endDate = new Date(+endYear, +endMonth, 0); // Ngày cuối cùng của tháng kết thúc

      filter.joiningDate = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      };

      delete filter.joiningStartMonthYear;
      delete filter.joiningEndMonthYear;
    }

    // Xử lý khoảng thời gian từ tháng/năm đến tháng/năm cho leavingDate
    if (filter.leavingStartMonthYear && filter.leavingEndMonthYear) {
      const [leavingStartYear, leavingStartMonth] =
        filter.leavingStartMonthYear.split('/');
      const [leavingEndYear, leavingEndMonth] =
        filter.leavingEndMonthYear.split('/');

      const leavingStartDate = new Date(
        +leavingStartYear,
        +leavingStartMonth - 1,
        1,
      ); // Ngày đầu tiên của tháng bắt đầu
      const leavingEndDate = new Date(+leavingEndYear, +leavingEndMonth, 0); // Ngày cuối cùng của tháng kết thúc

      filter.leavingDate = {
        $gte: leavingStartDate.toISOString().split('T')[0],
        $lte: leavingEndDate.toISOString().split('T')[0],
      };
      delete filter.leavingStartMonthYear;
      delete filter.leavingEndMonthYear;
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.unionistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.unionistModel
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

    const unionist = await this.unionistModel
      .findOne({
        _id: id,
      })
      .select('-password') //không trả về password
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });

    return unionist;
  }

  async findUnionistNameWithUnionistId(id: string) {
    const unionistIdRegex = /^CD\d{5}$/;
    if (!unionistIdRegex.test(id))
      throw new BadRequestException('ID không hợp lệ!');

    const unionist = await this.unionistModel.findOne({ id }).select('name'); // trả về name

    return unionist;
  }

  private async findOneWithPassword(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    const unionist = await this.unionistModel
      .findOne({
        _id: id,
      })
      .select('password');
    return unionist;
  }

  async findOneByUserName(unionistname: string) {
    const unionist = await this.unionistModel.findOne({
      email: unionistname,
    });
    return unionist;
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `ID không hợp lệ`;

    const foundUser = await this.unionistModel.findById(id);
    if (
      foundUser &&
      foundUser.email === this.configService.get<string>('EMAIL_ADMIN')
    )
      throw new BadRequestException('Không thể xóa tài khoản Admin');

    await this.unionistModel.updateOne(
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

    return this.unionistModel.softDelete({
      _id: id,
    });
  }

  async update(_id: string, updateUnionistDto: UpdateUnionistDto, user: IUser) {
    //logic check email exist
    let { email } = updateUnionistDto;
    const currentEmail = await this.unionistModel.findOne({ _id });
    // Convert email to lowercase
    email = email.toLowerCase();

    if (email !== currentEmail.email) {
      const isExistUnionist = await this.unionistModel.findOne({ email });
      const isExistUser = await this.usersService.findOneByUserName(email);
      if (isExistUser || isExistUnionist)
        throw new BadRequestException(
          `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
        );
    }

    const updated = await this.unionistModel.updateOne(
      {
        _id: updateUnionistDto._id,
      },
      {
        ...updateUnionistDto,
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
    updateInfoUnionistDto: UpdateInfoUnionistDto,
    user: IUser,
  ) {
    const updated = await this.unionistModel.updateOne(
      {
        _id: updateInfoUnionistDto._id,
      },
      {
        ...updateInfoUnionistDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async updateUnionistPermissions(
    _id: string,
    updateUnionistPermissionsDto: UpdateUnionistPermissionsDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ!');

    const { permissions } = updateUnionistPermissionsDto;

    const updated = await this.unionistModel.updateOne(
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

  updateUnionistToken = async (refreshToken: string, _id: string) => {
    return await this.unionistModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };

  findUnionistByToken = async (refreshToken: string) => {
    return await this.unionistModel.findOne({
      refreshToken,
    });
  };

  async countUnionists() {
    return await this.unionistModel.countDocuments({ isDeleted: false });
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

  async requestChangeEmail(
    unionistId: string,
    newEmail: string,
    unionist: IUnionist,
  ) {
    // Validate new email format
    if (!isValidEmail(newEmail)) {
      throw new BadRequestException('Email phải có đuôi @stu.edu.vn');
    }

    const isExist = await this.unionistModel.findOne({ email: newEmail });
    if (isExist) {
      throw new BadRequestException(
        `Email đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
      );
    }

    const uuid = uuidv4().replace(/-/g, '');
    const verificationCode = uuid.slice(0, 5);
    const verificationExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 phút

    const result = await this.unionistModel.updateOne(
      { _id: unionistId },
      {
        verificationCode,
        verificationExpires,
      },
    );

    // Encrypt new email
    const encryptedNewEmail = this.encrypt(newEmail);

    // Lấy email hiện tại từ cơ sở dữ liệu
    const currentUser = await this.unionistModel
      .findById(unionistId)
      .select('email');

    // Send confirmation email to current email
    await this.sendChangeEmailConfirmationEmail(
      currentUser.email,
      encryptedNewEmail,
      verificationCode,
      unionist,
    );

    return result;
  }

  async sendChangeEmailConfirmationEmail(
    email: string,
    encryptedNewEmail: string,
    verificationCode: string,
    unionist: IUnionist,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: '"Công Đoàn Trường ĐHCNSG" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Thay Đổi Email',
      template: 'change-mail',
      context: {
        receiver: unionist.name,
        verificationCode,
        url: `${this.configService.get<string>(
          'FRONTEND_URL',
        )}/confirm-change-email/${unionist._id}?newEmail=${encryptedNewEmail}`,
      },
    });
  }

  async confirmChangeEmail(
    unionistId: string,
    verificationCode: string,
    encryptedNewEmail: string,
  ) {
    // Decrypt email mới
    const newEmail = this.decrypt(encryptedNewEmail);

    // Kiểm tra định dạng email mới
    if (!isValidEmail(newEmail)) {
      throw new BadRequestException('Email phải có đuôi @stu.edu.vn');
    }

    // Tìm kiếm unionist theo unionistId và verificationCode
    const findUnionist = await this.unionistModel.findOne({
      _id: unionistId,
      verificationCode,
      verificationExpires: { $gt: new Date() }, // verificationCode phải hợp lệ
    });

    if (!findUnionist) {
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật email và xóa verificationCode, verificationExpires
    await this.unionistModel.findByIdAndUpdate(unionistId, {
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

    const isExist = await this.unionistModel.findOne({ email: email });

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
      result = await this.unionistModel.updateOne(
        { email: email },
        {
          verificationCodePassword,
          verificationExpiresPassword,
        },
      );
    }

    // Lấy email hiện tại từ cơ sở dữ liệu
    const currentUnionist = await this.unionistModel
      .findOne({ email: email })
      .select('email');

    // Send confirmation email to current email
    await this.sendForgotPasswordConfirmationEmail(
      currentUnionist.email,
      verificationCodePassword,
    );

    return result;
  }

  async sendForgotPasswordConfirmationEmail(
    email: string,
    verificationCodePassword: string,
  ) {
    const currentUnionist = await this.unionistModel.findOne({ email: email });

    await this.mailerService.sendMail({
      to: email,
      from: '"Công Đoàn Trường ĐHCNSG" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Đặt Lại Mật Khẩu',
      template: 'forgot-password',
      context: {
        receiver: currentUnionist.name,
        verificationCodePassword,
        url: `${this.configService.get<string>(
          'FRONTEND_URL',
        )}/confirm-forgot-password/${currentUnionist._id}`,
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

    // Tìm kiếm unionist theo unionistId và verificationCodePassword
    const findUnionist = await this.unionistModel.findOne({
      _id: id,
      verificationCodePassword,
      verificationExpiresPassword: { $gt: new Date() }, // verificationCode phải hợp lệ
    });

    if (!findUnionist) {
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật password và xóa verificationCodePassword, verificationExpiresPassword
    const result = await this.unionistModel.findOneAndUpdate(
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
      if ((row as any[]).length < 12) {
        // Cần ít nhất 11 cột
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra các giá trị cột có hợp lệ không
      let unionistEmail = row[0];
      const unionistName = row[1];
      const unionistGender = row[2];
      const unionistBirthday = row[3];
      const unionistPhoneNumber = row[4] || null;
      const unionistCCCD = row[5] || null;
      const unionistAddress = row[6] || null;
      const unionistNote = row[7] || null;
      const unionistJoiningDate = row[8] || null;
      const unionistLeavingDate = row[9] || null;
      const unionistUnionEntryDate = row[10] || null;
      const unionistDepartment = row[11] || null;

      // Kiểm tra các giá trị cần thiết
      if (
        !unionistEmail ||
        !unionistName ||
        !unionistGender ||
        !unionistBirthday
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra email
      if (!isValidEmail(unionistEmail)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra giới tính
      if (
        unionistGender !== 'MALE' &&
        unionistGender !== 'FEMALE' &&
        unionistGender !== 'OTHER'
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      if (!isValidDateOfBirth(unionistBirthday)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Convert email to lowercase
      unionistEmail = unionistEmail.toLowerCase();

      if (unionistName.length > 30) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra số điện thoại nếu có
      if (
        unionistPhoneNumber &&
        !/^(03|05|07|08|09)[0-9]{8}$/.test(unionistPhoneNumber)
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra đơn vị nếu có
      if (unionistDepartment && !/^DV\d{2}$/.test(unionistDepartment)) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra CCCD nếu có
      if (unionistCCCD && !/^\d{12}$/.test(unionistCCCD)) {
        invalidRows.push(index + 2);
        return false;
      }

      if (unionistNote && unionistNote.length > 50) {
        invalidRows.push(index + 2);
        return false;
      }

      if (unionistAddress && unionistAddress.length > 150) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra ngày chuyển đến nếu có
      if (
        unionistJoiningDate &&
        !isValidDateRange(unionistJoiningDate, 'dd/mm/yyyy')
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra ngày rời đi nếu có
      if (
        unionistLeavingDate &&
        !isValidDateRange(unionistLeavingDate, 'dd/mm/yyyy')
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      // Kiểm tra ngày gia nhập công đoàn nếu có
      if (
        unionistUnionEntryDate &&
        !isValidDateRange(unionistUnionEntryDate, 'dd/mm/yyyy')
      ) {
        invalidRows.push(index + 2);
        return false;
      }

      emailChecks.push(this.unionistModel.findOne({ email: unionistEmail }));
      emailChecks.push(this.usersService.findOneByUserName(unionistEmail));

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
      let unionistEmail = row[0];
      const unionistName = row[1];
      const unionistGender = row[2];
      const unionistBirthday = row[3];
      const unionistPhoneNumber = row[4] || null;
      const unionistCCCD = row[5] || null;
      const unionistAddress = row[6] || null;
      const unionistNote = row[7] || null;
      const unionistJoiningDate = row[8] || null;
      const unionistLeavingDate = row[9] || null;
      const unionistUnionEntryDate = row[10] || null;
      const unionistDepartment = row[11] || null;

      // Convert email to lowercase
      unionistEmail = unionistEmail.toLowerCase();

      const formattedDateBirthday = convertToISODate(unionistBirthday);
      let formattedDateJoining = '1970-01-01';
      let formattedDateLeaving = '1970-01-01';
      let formattedDateUnionEntry = '1970-01-01';

      if (unionistJoiningDate)
        formattedDateJoining = convertToISODate(unionistJoiningDate);

      if (unionistLeavingDate)
        formattedDateLeaving = convertToISODate(unionistLeavingDate);

      if (unionistUnionEntryDate)
        formattedDateUnionEntry = convertToISODate(unionistUnionEntryDate);

      try {
        // Tạo mới bản ghi unionist
        await this.unionistModel.create({
          name: unionistName,
          password: this.getHashPassword(
            this.configService.get<string>('INIT_PASSWORD'),
          ),
          email: unionistEmail,
          gender: unionistGender,
          dateOfBirth: formattedDateBirthday,
          phoneNumber: unionistPhoneNumber,
          CCCD: unionistCCCD,
          address: unionistAddress,
          note: unionistNote,
          permissions: [
            new ObjectId('666f3672d8d4bd537d4407ef'), //Xem thông tin chi tiết công đoàn viên
            new ObjectId('66b45770a24d3fc3d850430c'), //Công đoàn viên cập nhật thông tin
            new ObjectId('6694cc16fda6b0a670cd3e42'), //Gửi yêu cầu thay đổi email
            new ObjectId('6694cc7cfda6b0a670cd3e4b'), //Xác nhận thay đổi email
            new ObjectId('6694cc9d047108a8053a8cce'), //Thay đổi mật khẩu
            new ObjectId('66a5e5a406d2f0606ea29bae'), //Lấy thông tin đóng công đoàn phí
          ],
          joiningDate: formattedDateJoining,
          leavingDate: formattedDateLeaving,
          unionEntryDate: formattedDateUnionEntry,
          departmentId: unionistDepartment,
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
