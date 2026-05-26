import 'reflect-metadata';

import * as bcrypt from 'bcrypt';
import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../app.module';
import {
  AcademicSession,
  SessionStatus,
} from '../modules/academic-session/entities/academic-session.entity';
import { Term, TermName, TermStatus } from '../modules/academic-term/entities/term.entity';
import { Class } from '../modules/class/entities/class.entity';
import { ClassStudent } from '../modules/class/entities/class-student.entity';
import { ClassSubject } from '../modules/class/entities/class-subject.entity';
import { ClassTeacher } from '../modules/class/entities/class-teacher.entity';
import { Fees } from '../modules/fees/entities/fees.entity';
import { FeeStatus } from '../modules/fees/enums/fees.enums';
import {
  PaymentMethod,
  PaymentStatus,
} from '../modules/payment/enums/payment.enums';
import { Payment } from '../modules/payment/entities/payment.entity';
import { Parent } from '../modules/parent/entities/parent.entity';
import { Result } from '../modules/result/entities/result.entity';
import { ResultSubjectLine } from '../modules/result/entities/result-subject-line.entity';
import { School } from '../modules/school/entities/school.entity';
import { Stream } from '../modules/stream/entities/stream.entity';
import { Student } from '../modules/student/entities/student.entity';
import { Subject } from '../modules/subject/entities/subject.entity';
import { Role, SuperAdmin } from '../modules/superadmin/entities/superadmin.entity';
import { TeacherTitle } from '../modules/teacher/enums/teacher.enum';
import { Teacher } from '../modules/teacher/entities/teacher.entity';
import { User, UserRole } from '../modules/user/entities/user.entity';

import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const config = new ConfigService();
const DEMO_PASSWORD = config.get<string>('DEMO_PASSWORD') ?? 'DemoPass123!';
const logger = new Logger('seed-demo');

function mergeRoles(existingRoles: UserRole[] = [], incoming: UserRole[]) {
  return Array.from(new Set([...(existingRoles || []), ...incoming]));
}

async function upsertUser(
  userRepo: Repository<User>,
  email: string,
  firstName: string,
  lastName: string,
  roles: UserRole[],
  hashedPassword: string,
) {
  const existing = await userRepo.findOne({ where: { email } });

  if (existing) {
    existing.first_name = firstName;
    existing.last_name = lastName;
    existing.is_active = true;
    existing.is_verified = true;
    existing.role = mergeRoles(existing.role, roles);
    if (!existing.password) {
      existing.password = hashedPassword;
    }
    return userRepo.save(existing);
  }

  const user = userRepo.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password: hashedPassword,
    is_active: true,
    is_verified: true,
    role: roles,
  });

  return userRepo.save(user);
}

async function run() {
  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error('Refusing to run demo seed in production');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    await dataSource.transaction(async (manager) => {
      const schoolRepo = manager.getRepository(School);
      const userRepo = manager.getRepository(User);
      const teacherRepo = manager.getRepository(Teacher);
      const parentRepo = manager.getRepository(Parent);
      const studentRepo = manager.getRepository(Student);
      const superadminRepo = manager.getRepository(SuperAdmin);
      const academicSessionRepo = manager.getRepository(AcademicSession);
      const termRepo = manager.getRepository(Term);
      const classRepo = manager.getRepository(Class);
      const streamRepo = manager.getRepository(Stream);
      const subjectRepo = manager.getRepository(Subject);
      const classTeacherRepo = manager.getRepository(ClassTeacher);
      const classStudentRepo = manager.getRepository(ClassStudent);
      const classSubjectRepo = manager.getRepository(ClassSubject);
      const feesRepo = manager.getRepository(Fees);
      const paymentRepo = manager.getRepository(Payment);
      const resultRepo = manager.getRepository(Result);
      const resultLineRepo = manager.getRepository(ResultSubjectLine);

      let school = await schoolRepo.findOne({ where: { name: "St. Brian's Model College" } });
      if (!school) {
        school = schoolRepo.create({
          name: "St. Brian's Model College",
          email: 'info@stbrians.demo',
          phone: '+2348000000000',
          installation_completed: true,
        });
        school = await schoolRepo.save(school);
      }

      const adminUser = await upsertUser(
        userRepo,
        'admin.demo@stbrians.edu',
        'System',
        'Admin',
        [UserRole.ADMIN],
        hashedPassword,
      );

      const teacherUser = await upsertUser(
        userRepo,
        'teacher.demo@stbrians.edu',
        'Amaka',
        'Okoro',
        [UserRole.TEACHER],
        hashedPassword,
      );

      const parentUser = await upsertUser(
        userRepo,
        'parent.demo@stbrians.edu',
        'Ifeanyi',
        'Eze',
        [UserRole.PARENT],
        hashedPassword,
      );

      const studentUser = await upsertUser(
        userRepo,
        'student.demo@stbrians.edu',
        'Chinonso',
        'Eze',
        [UserRole.STUDENT],
        hashedPassword,
      );

      let superadmin = await superadminRepo.findOne({
        where: { email: 'superadmin.demo@stbrians.edu' },
      });
      if (!superadmin) {
        superadmin = superadminRepo.create({
          first_name: 'Platform',
          last_name: 'Owner',
          email: 'superadmin.demo@stbrians.edu',
          school_name: school.name,
          password: hashedPassword,
          is_active: true,
          role: Role.SUPERADMIN,
        });
        await superadminRepo.save(superadmin);
      }

      let teacher = await teacherRepo.findOne({
        where: { user_id: teacherUser.id },
      });
      if (!teacher) {
        teacher = teacherRepo.create({
          user_id: teacherUser.id,
          employment_id: 'EMP-DEMO-001',
          title: TeacherTitle.MR,
          is_active: true,
          user: teacherUser,
        });
        teacher = await teacherRepo.save(teacher);
      }

      let parent = await parentRepo.findOne({
        where: { user_id: parentUser.id },
      });
      if (!parent) {
        parent = parentRepo.create({
          user_id: parentUser.id,
          is_active: true,
          user: parentUser,
        });
        parent = await parentRepo.save(parent);
      }

      let academicSession = await academicSessionRepo.findOne({
        where: { name: '2026/2027 Session' },
      });
      if (!academicSession) {
        academicSession = academicSessionRepo.create({
          name: '2026/2027 Session',
          academicYear: '2026/2027',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2027-07-31'),
          status: SessionStatus.ACTIVE,
          description: 'Demo academic session',
        });
        academicSession = await academicSessionRepo.save(academicSession);
      }

      let firstTerm = await termRepo.findOne({
        where: { sessionId: academicSession.id, name: TermName.FIRST },
      });
      if (!firstTerm) {
        firstTerm = termRepo.create({
          sessionId: academicSession.id,
          academicSession,
          name: TermName.FIRST,
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-12-15'),
          status: TermStatus.ACTIVE,
          isCurrent: true,
        });
        firstTerm = await termRepo.save(firstTerm);
      }

      let demoClass = await classRepo
        .createQueryBuilder('class')
        .leftJoinAndSelect('class.academicSession', 'academicSession')
        .where('class.name = :name', { name: 'JSS 1' })
        .andWhere('class.arm = :arm', { arm: 'A' })
        .andWhere('academicSession.id = :sessionId', {
          sessionId: academicSession.id,
        })
        .getOne();

      if (!demoClass) {
        demoClass = classRepo.create({
          name: 'JSS 1',
          arm: 'A',
          stream: 'Gold',
          academicSession,
        });
        demoClass = await classRepo.save(demoClass);
      }

      let stream = await streamRepo.findOne({
        where: { class_id: demoClass.id, name: 'Gold' },
      });
      if (!stream) {
        stream = streamRepo.create({
          name: 'Gold',
          class_id: demoClass.id,
          class: demoClass,
        });
        stream = await streamRepo.save(stream);
      }

      let student = await studentRepo.findOne({
        where: { registration_number: 'STB-DEMO-001' },
      });
      if (!student) {
        student = studentRepo.create({
          registration_number: 'STB-DEMO-001',
          user: studentUser,
          stream,
          parent,
          current_class: demoClass,
          current_class_id: demoClass.id,
          is_deleted: false,
          deleted_at: null,
        });
        student = await studentRepo.save(student);
      }

      let mathematics = await subjectRepo.findOne({
        where: { name: 'Mathematics' },
      });
      if (!mathematics) {
        mathematics = subjectRepo.create({ name: 'Mathematics' });
        mathematics = await subjectRepo.save(mathematics);
      }

      let english = await subjectRepo.findOne({
        where: { name: 'English Language' },
      });
      if (!english) {
        english = subjectRepo.create({ name: 'English Language' });
        english = await subjectRepo.save(english);
      }

      const existingClassTeacher = await classTeacherRepo
        .createQueryBuilder('ct')
        .leftJoin('ct.class', 'class')
        .leftJoin('ct.teacher', 'teacher')
        .where('class.id = :classId', { classId: demoClass.id })
        .andWhere('teacher.id = :teacherId', { teacherId: teacher.id })
        .getOne();

      if (!existingClassTeacher) {
        await classTeacherRepo.save(
          classTeacherRepo.create({
            session_id: academicSession.id,
            class: demoClass,
            teacher,
            is_active: true,
          }),
        );
      }

      const existingClassStudent = await classStudentRepo
        .createQueryBuilder('cs')
        .leftJoin('cs.class', 'class')
        .leftJoin('cs.student', 'student')
        .where('class.id = :classId', { classId: demoClass.id })
        .andWhere('student.id = :studentId', { studentId: student.id })
        .getOne();

      if (!existingClassStudent) {
        await classStudentRepo.save(
          classStudentRepo.create({
            session_id: academicSession.id,
            class: demoClass,
            student,
            is_active: true,
          }),
        );
      }

      const subjectsToAssign = [mathematics, english];
      for (const subject of subjectsToAssign) {
        const existingClassSubject = await classSubjectRepo
          .createQueryBuilder('classSubject')
          .leftJoin('classSubject.class', 'class')
          .leftJoin('classSubject.subject', 'subject')
          .where('class.id = :classId', { classId: demoClass.id })
          .andWhere('subject.id = :subjectId', { subjectId: subject.id })
          .getOne();

        if (!existingClassSubject) {
          await classSubjectRepo.save(
            classSubjectRepo.create({
              class: demoClass,
              subject,
              teacher,
              teacher_assignment_date: new Date(),
            }),
          );
        }
      }

      let tuitionFee = await feesRepo.findOne({
        where: { component_name: 'Tuition Fee', term_id: firstTerm.id },
        relations: { classes: true },
      });

      if (!tuitionFee) {
        tuitionFee = feesRepo.create({
          component_name: 'Tuition Fee',
          description: 'Demo tuition for first term',
          amount: 50000,
          term_id: firstTerm.id,
          term: firstTerm,
          classes: [demoClass],
          status: FeeStatus.ACTIVE,
          created_by: adminUser.id,
          createdBy: adminUser,
        });
      } else if (!tuitionFee.classes.some((item) => item.id === demoClass.id)) {
        tuitionFee.classes.push(demoClass);
      }
      tuitionFee = await feesRepo.save(tuitionFee);

      let payment = await paymentRepo.findOne({
        where: { invoice_number: 'INV-DEMO-001' },
      });
      if (!payment) {
        payment = paymentRepo.create({
          student_id: student.id,
          student,
          fee_component_id: tuitionFee.id,
          fee_component: tuitionFee,
          amount_paid: 50000,
          payment_method: PaymentMethod.BANK_TRANSFER,
          payment_date: new Date(),
          term_id: firstTerm.id,
          term: firstTerm,
          session_id: academicSession.id,
          invoice_number: 'INV-DEMO-001',
          transaction_id: 'TXN-DEMO-001',
          status: PaymentStatus.PAID,
          recorded_by: adminUser.id,
          recorded_by_user: adminUser,
        });
        await paymentRepo.save(payment);
      }

      let result = await resultRepo.findOne({
        where: {
          student_id: student.id,
          class_id: demoClass.id,
          term_id: firstTerm.id,
          academic_session_id: academicSession.id,
        },
      });

      if (!result) {
        result = resultRepo.create({
          student_id: student.id,
          student,
          class_id: demoClass.id,
          class: demoClass,
          term_id: firstTerm.id,
          term: firstTerm,
          academic_session_id: academicSession.id,
          academicSession,
          total_score: 154,
          average_score: 77,
          grade_letter: 'A',
          position: 1,
          remark: 'Excellent performance',
          subject_count: 2,
          generated_at: new Date(),
        });
        result = await resultRepo.save(result);
      }

      const resultLines = [
        {
          subject: mathematics,
          ca_score: 28,
          exam_score: 50,
          total_score: 78,
          grade_letter: 'A',
          remark: 'Very Good',
        },
        {
          subject: english,
          ca_score: 26,
          exam_score: 50,
          total_score: 76,
          grade_letter: 'A',
          remark: 'Very Good',
        },
      ];

      for (const line of resultLines) {
        const existingLine = await resultLineRepo.findOne({
          where: { result_id: result.id, subject_id: line.subject.id },
        });

        if (!existingLine) {
          await resultLineRepo.save(
            resultLineRepo.create({
              result_id: result.id,
              result,
              subject_id: line.subject.id,
              subject: line.subject,
              ca_score: line.ca_score,
              exam_score: line.exam_score,
              total_score: line.total_score,
              grade_letter: line.grade_letter,
              remark: line.remark,
            }),
          );
        }
      }
    });

    logger.log('Demo seed complete.');
    logger.log('Demo login credentials:');
    logger.log(`Password for seeded users: ${DEMO_PASSWORD}`);
    logger.log('admin.demo@stbrians.edu');
    logger.log('teacher.demo@stbrians.edu');
    logger.log('parent.demo@stbrians.edu');
    logger.log('student.demo@stbrians.edu');
    logger.log('superadmin.demo@stbrians.edu');
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  logger.error('Demo seed failed:', error as any);
  process.exit(1);
});
