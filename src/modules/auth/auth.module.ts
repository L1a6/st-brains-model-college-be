import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
<<<<<<< HEAD
import { InviteModule } from '../invites/invites.module';
=======
import { Invite } from '../invites/entities/invites.entity';
import { InviteModelAction } from '../invites/invite.model-action';
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
import { Parent } from '../parent/entities/parent.entity';
import { SessionModule } from '../session/session.module';
import { Student } from '../student/entities/student.entity';
import { Teacher } from '../teacher/entities/teacher.entity';
import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    EmailModule,
<<<<<<< HEAD
    InviteModule,
    SessionModule,
    PassportModule,
    TypeOrmModule.forFeature([Teacher, Student, Parent]),
=======
    SessionModule,
    PassportModule,
    TypeOrmModule.forFeature([Teacher, Student, Parent, Invite]),
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '4h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
<<<<<<< HEAD
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
=======
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    InviteModelAction,
  ],
>>>>>>> cb0e039 (feat: build backend for St.Brain's College)
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
