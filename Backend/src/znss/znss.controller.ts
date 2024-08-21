import { Controller, Post, Body } from '@nestjs/common';
import { ZnssService } from './znss.service';
import { CreateZnssDto } from './dto/create-znss.dto';
import { Public } from 'src/decorator/customize';

@Controller('znss')
export class ZnssController {
  constructor(private readonly znssService: ZnssService) {}

  @Public()
  @Post()
  create(@Body() createZnssDto: CreateZnssDto) {
    return this.znssService.create(createZnssDto);
  }

  // @Public()
  @Post('get-new-access-token')
  getNewAccessToken() {
    return this.znssService.getNewAccessToken();
  }
}
