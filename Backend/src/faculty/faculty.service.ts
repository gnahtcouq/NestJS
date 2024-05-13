import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty, FacultyDocument } from 'src/faculty/schemas/faculty.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';

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

  update(id: number, updateFacultyDto: UpdateFacultyDto) {
    return `This action updates a #${id} faculty`;
  }

  remove(id: number) {
    return `This action removes a #${id} faculty`;
  }
}
