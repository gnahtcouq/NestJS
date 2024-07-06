/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
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
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      address,
      role,
      CCCD,
      // department,
      // joiningDate,
      // leavingDate,
      // unionEntryDate,
      note,
    } = createUserDto;

    //logic check email exist
    const isExist = await this.userModel.findOne({ email });
    if (isExist)
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      role,
      CCCD,
      // department,
      // joiningDate,
      // leavingDate,
      // unionEntryDate,
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

    //logic check email exist
    const isExist = await this.userModel.findOne({ email });
    if (isExist)
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`,
      );

    //fetch user role
    const userRole = await this.roleModel.findOne({
      name: USER_ROLE,
    });

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      role: userRole?._id,
      // joiningDate: '',
      // leavingDate: '',
      // unionEntryDate: '',
      note: '',
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
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  findOneByUserName(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({ path: 'role', select: { name: 1 } });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async update(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
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
    return await this.userModel
      .findOne({
        refreshToken,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  };

  async countUsers() {
    return await this.userModel.countDocuments({ isDeleted: false });
  }

  async requestEmailChange(userId: string, newEmail: string, user: IUser) {
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

    // Send confirmation email to current email
    await this.sendEmailChangeConfirmationEmail(
      user.email,
      newEmail,
      verificationCode,
      user,
    );

    return result;
  }

  async sendEmailChangeConfirmationEmail(
    email: string,
    newEmail: string,
    verificationCode: string,
    user: IUser,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: '"Saigon Technology University" <support@stu.id.vn>',
      subject: 'Xác Nhận Yêu Cầu Thay Đổi Email',
      template: 'mail-change',
      context: {
        receiver: user.name,
        verificationCode,
        url: `${this.configService.get<string>(
          'FRONTEND_URL',
        )}/confirm-email-change/${user._id}?newEmail=${newEmail}`,
      },
    });
  }

  async confirmEmailChange(
    userId: string,
    verificationCode: string,
    newEmail: string,
  ) {
    // Find the user by userId and verificationCode
    const findUser = await this.userModel.findOne({
      _id: userId,
      verificationCode,
      verificationExpires: { $gt: new Date() }, // Verification code should be valid
    });

    if (!findUser) {
      throw new BadRequestException(
        'Mã xác minh không hợp lệ hoặc đã hết hạn.',
      );
    }

    // Update email and clear verification fields
    await this.userModel.findByIdAndUpdate(userId, {
      email: newEmail,
      $unset: {
        verificationCode: 1,
        verificationExpires: 1,
      },
    });

    return true;
  }
}
