import { Injectable } from '@nestjs/common';
import { CreateZnssDto } from './dto/create-znss.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Znss, ZnssDocument } from 'src/znss/schemas/znss.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import axios from 'axios';

@Injectable()
export class ZnssService {
  constructor(
    @InjectModel(Znss.name)
    private znssModel: SoftDeleteModel<ZnssDocument>,
  ) {}

  async create(createZnssDto: CreateZnssDto) {
    const { access_token, refresh_token } = createZnssDto;

    // Kiểm tra nếu bảng không có bản ghi nào
    const existingZnss = await this.znssModel.findOne().exec();

    if (!existingZnss) {
      // Nếu không có bản ghi nào, tạo bản ghi mới
      const newZnss = await this.znssModel.create({
        access_token,
        refresh_token,
      });

      return {
        _id: newZnss?._id,
        createdAt: newZnss?.createdAt,
      };
    } else {
      // Nếu có bản ghi, cập nhật bản ghi đó
      existingZnss.access_token = access_token;
      existingZnss.refresh_token = refresh_token;
      await existingZnss.save();
      return {
        _id: existingZnss._id,
        createdAt: existingZnss.createdAt,
      };
    }
  }

  getNewAccessToken = async () => {
    const existingZnss = await this.znssModel.findOne().exec();
    console.log('Tạo mới access token ZNS...');
    try {
      const response = await axios.post(
        process.env.ZNS_REFRESH_TOKEN_URL,
        new URLSearchParams({
          app_id: process.env.ZNS_APP_ID,
          grant_type: 'refresh_token',
          refresh_token: existingZnss.refresh_token,
        }).toString(),
        {
          headers: {
            Secret_key: process.env.ZNS_SECRET_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;

      await this.znssModel.updateOne(
        { _id: existingZnss._id },
        {
          $set: {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
          },
        },
      );

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Tạo mới access token thất bại');
      }

      return 'Tạo mới access token thành công';
    } catch (error) {
      console.error('Lỗi khi tạo mới access token:', error);
      throw new Error('Lỗi khi tạo mới access token');
    }
  };

  sendNotification = async (phoneNumber: string, otpStr: string) => {
    const existingZnss = await this.znssModel.findOne().exec();
    const response = await axios.post(
      `${process.env.ZNS_URL}`,
      {
        mode: 'development',
        template_id: `${process.env.ZNS_TEMPLATE_ID}`,
        template_data: {
          otp: otpStr,
        },
        phone: phoneNumber,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: existingZnss.access_token,
        },
      },
    );

    return response.data;
  };
}
