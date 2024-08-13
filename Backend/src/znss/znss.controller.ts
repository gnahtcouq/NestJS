import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ZnssService } from './znss.service';
import { CreateZnssDto } from './dto/create-znss.dto';
import { UpdateZnssDto } from './dto/update-znss.dto';
import { Public } from 'src/decorator/customize';

@Controller('znss')
export class ZnssController {
  constructor(private readonly znssService: ZnssService) {}

  @Public()
  @Post()
  create(@Body() createZnssDto: CreateZnssDto) {
    return this.znssService.create(createZnssDto);
  }
}
