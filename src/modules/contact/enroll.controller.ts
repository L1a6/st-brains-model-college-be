import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('enroll')
export class EnrollController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit({ maxRequests: 3, windowMs: 15 * 60 * 1000 })
  create(@Body() enrollmentDto: CreateContactDto) {
    return this.contactService.create(enrollmentDto);
  }
}
