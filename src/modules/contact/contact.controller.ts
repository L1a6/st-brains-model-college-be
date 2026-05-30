import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

import { ContactService } from './contact.service';
import { ApiContactTags, ApiCreateContact } from './docs/contact.swagger';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
@ApiContactTags()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('enrollments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listEnrollments(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.contactService.findAll({ page, limit });
  }
  @Post()
  @UseGuards(RateLimitGuard)
  @RateLimit({ maxRequests: 3, windowMs: 15 * 60 * 1000 }) // 3 requests per 15 minutes
  @ApiCreateContact()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
}
