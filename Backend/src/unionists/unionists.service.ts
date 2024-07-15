/* eslint-disable prefer-const */
import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class UnionistsService {
  private readonly encryptionKey: Buffer;
  private readonly ivLength: number = 16; // Đảm bảo ivLength là số
  constructor(
    @InjectModel(Unionist.name)
    private unionistModel: SoftDeleteModel<UnionistDocument>,
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

  async create(
    createUnionistDto: CreateUnionistDto,
    @User() unionist: IUnionist,
  ) {
    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      address,
      CCCD,
      department,
      joiningDate,
      leavingDate,
      unionEntryDate,
      note,
    } = createUnionistDto;

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Email mới không hợp lệ');
    }

    //logic check email exist
    const isExist = await this.unionistModel.findOne({ email });
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

    const hashPassword = this.getHashPassword(password);

    let newUnionist = await this.unionistModel.create({
      name,
      email,
      password: hashPassword,
      dateOfBirth,
      gender,
      address,
      permissions: [
        new ObjectId('666f3672d8d4bd537d4407ef'), //Xem thông tin chi tiết công đoàn viên
        new ObjectId('666f3680006c1579a34d5ec2'), //Cập nhật thông tin công đoàn viên
        new ObjectId('6694cc16fda6b0a670cd3e42'), //Gửi yêu cầu thay đổi email
        new ObjectId('6694cc7cfda6b0a670cd3e4b'), //Xác nhận thay đổi email
        new ObjectId('6694cc9d047108a8053a8cce'), //Thay đổi mật khẩu
      ],
      CCCD,
      department,
      joiningDate,
      leavingDate,
      unionEntryDate,
      note,
      createdBy: {
        _id: unionist._id,
        email: unionist.email,
      },
    });
    return newUnionist;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('ID không hợp lệ!');

    return this.unionistModel
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

    return this.unionistModel
      .findOne({
        _id: id,
      })
      .populate({
        path: 'permissions',
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
      });
  }

  findOneByUserName(unionistname: string) {
    return this.unionistModel.findOne({
      email: unionistname,
    });
  }

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async remove(id: string, unionist: IUnionist) {
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
          _id: unionist._id,
          email: unionist.email,
        },
      },
    );

    return this.unionistModel.softDelete({
      _id: id,
    });
  }

  async update(
    _id: string,
    updateUnionistDto: UpdateUnionistDto,
    unionist: IUnionist,
  ) {
    const updated = await this.unionistModel.updateOne(
      {
        _id: updateUnionistDto._id,
      },
      {
        ...updateUnionistDto,
        updatedBy: {
          _id: unionist._id,
          email: unionist.email,
        },
      },
    );

    return updated;
  }

  async updateUnionistPermissions(
    _id: string,
    updateUnionistPermissionsDto: UpdateUnionistPermissionsDto,
    unionist: IUnionist,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('ID không hợp lệ!');

    const { permissions } = updateUnionistPermissionsDto;

    const updated = await this.unionistModel.updateOne(
      { _id },
      {
        permissions,
        updatedBy: {
          _id: unionist._id,
          email: unionist.email,
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
    if (!this.isValidEmail(newEmail)) {
      throw new BadRequestException('Email mới không hợp lệ');
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
      from: '"Saigon Technology University" <support@stu.id.vn>',
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
    if (!this.isValidEmail(newEmail)) {
      throw new BadRequestException('Email mới không hợp lệ');
    }

    // Tìm kiếm unionist theo unionistId và verificationCode
    const findUser = await this.unionistModel.findOne({
      _id: unionistId,
      verificationCode,
      verificationExpires: { $gt: new Date() }, // verificationCode phải hợp lệ
    });

    if (!findUser) {
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
}
