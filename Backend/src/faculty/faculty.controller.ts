import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  create(@Body() createFacultyDto: CreateFacultyDto, @User() user: IUser) {
    return this.facultyService.create(createFacultyDto, user);
  }

  @Get()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    return this.facultyService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
    @User() user: IUser,
  ) {
    return this.facultyService.update(id, updateFacultyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.facultyService.remove(id, user);
  }
}
