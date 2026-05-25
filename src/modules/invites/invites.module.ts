import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { SchoolModule } from '../school/school.module';
import { UserModule } from '../user/user.module';

import { Invite } from './entities/invites.entity';
import { InviteModelAction } from './invite.model-action';
import { InvitesController } from './invites.controller';
import { InviteService } from './invites.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite]),
    SchoolModule,
    UserModule,
    EmailModule,
  ],
  controllers: [InvitesController],
  providers: [InviteService, InviteModelAction],
<<<<<<< HEAD
  exports: [InviteService, InviteModelAction],
=======
  exports: [InviteService],
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
})
export class InviteModule {}
