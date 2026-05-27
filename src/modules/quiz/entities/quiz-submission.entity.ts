import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm'

import { BaseEntity } from '../../../entities/base-entity'
import { Quiz } from './quiz.entity'
import { Student } from '../../student/entities/student.entity'

export type SubmissionStatus = 'in_progress' | 'submitted' | 'graded'

/**
 * QuizSubmission Entity
 *
 * Represents a student's submission/attempt of a quiz.
 */
@Unique(['quiz_id', 'student_id'])
@Entity('quiz_submissions')
export class QuizSubmission extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid' })
  quiz_id: string

  @ManyToOne(() => Quiz, (q) => q.submissions, { nullable: false })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string

  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: Student

  @Column({ type: 'simple-json' })
  answers: Record<string, string>

  @Column({ type: 'int', nullable: true })
  score?: number

  @Column({ type: 'int', nullable: true })
  max_score?: number

  @Column({ type: 'varchar', length: 50, default: 'in_progress' })
  status: SubmissionStatus

  @Column({ type: 'int', default: 0 })
  time_spent_seconds: number

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date

  @Column({ type: 'timestamp', nullable: true })
  graded_at?: Date

  @Column({ type: 'text', nullable: true })
  feedback?: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date
}
