import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty, FacultyDocument } from 'src/faculty/schemas/faculty.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name)
    private facultyModel: SoftDeleteModel<FacultyDocument>,
  ) {}

  create(createFacultyDto: CreateFacultyDto, user: IUser) {
    return this.facultyModel.create({
      ...createFacultyDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  findAll() {
    return `This action returns all faculty`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faculty`;
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto, user: IUser) {
    return await this.facultyModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateFacultyDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.facultyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.facultyModel.softDelete({
      _id: id,
    });
  }
}
