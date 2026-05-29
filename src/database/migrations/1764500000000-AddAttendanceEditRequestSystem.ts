import { MigrationInterface, QueryRunner } from 'typeorm';

import {
  AttendanceType,
  EditRequestStatus,
} from '../../modules/attendance/enums/attendance-status.enum';

export class AddAttendanceEditRequestSystem1764500000000
  implements MigrationInterface
{
  name = 'AddAttendanceEditRequestSystem1764500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid_generate_v4() is available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Add is_locked column to attendance_records if missing
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_records'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance_records' AND column_name = 'is_locked'
        ) THEN
          ALTER TABLE "attendance_records" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false;
        END IF;
      END
      $$;
    `);

    // Add is_locked column to student_daily_attendance if missing
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_daily_attendance'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'student_daily_attendance' AND column_name = 'is_locked'
        ) THEN
          ALTER TABLE "student_daily_attendance" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false;
        END IF;
      END
      $$;
    `);

    // Create attendance_edit_requests table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance_edit_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "attendance_id" uuid NOT NULL,
        "attendance_type" character varying NOT NULL,
        "requested_by" uuid NOT NULL,
        "proposed_changes" jsonb NOT NULL,
        "reason" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "admin_comment" text,
        CONSTRAINT "PK_attendance_edit_requests" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_attendance_type" CHECK ("attendance_type" IN ('${AttendanceType.SCHEDULE_BASED}', '${AttendanceType.DAILY}')),
        CONSTRAINT "CHK_status" CHECK ("status" IN ('${EditRequestStatus.PENDING}', '${EditRequestStatus.APPROVED}', '${EditRequestStatus.REJECTED}'))
      );
    `);

    // Create indexes if not exists
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_edit_requests_attendance" ON "attendance_edit_requests" ("attendance_id", "attendance_type");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_edit_requests_requested_by" ON "attendance_edit_requests" ("requested_by");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_edit_requests_status" ON "attendance_edit_requests" ("status");
    `);

    // Add foreign key constraints if not present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_attendance_edit_requests_requested_by'
        ) THEN
          ALTER TABLE "attendance_edit_requests" ADD CONSTRAINT "FK_attendance_edit_requests_requested_by" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_attendance_edit_requests_reviewed_by'
        ) THEN
          ALTER TABLE "attendance_edit_requests" ADD CONSTRAINT "FK_attendance_edit_requests_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints if present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_attendance_edit_requests_reviewed_by'
        ) THEN
          ALTER TABLE "attendance_edit_requests" DROP CONSTRAINT "FK_attendance_edit_requests_reviewed_by";
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_attendance_edit_requests_requested_by'
        ) THEN
          ALTER TABLE "attendance_edit_requests" DROP CONSTRAINT "FK_attendance_edit_requests_requested_by";
        END IF;
      END
      $$;
    `);

    // Drop indexes if present
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attendance_edit_requests_status";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attendance_edit_requests_requested_by";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attendance_edit_requests_attendance";`,
    );

    // Drop table if exists
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance_edit_requests";`);

    // Remove is_locked columns if present
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "student_daily_attendance" DROP COLUMN IF EXISTS "is_locked";`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "attendance_records" DROP COLUMN IF EXISTS "is_locked";`,
    );
  }
}
