import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm'

import { BaseEntity } from '../../../entities/base-entity'
import { Teacher } from '../../teacher/entities/teacher.entity'
import { Class } from '../../class/entities/class.entity'
import { AcademicSession } from '../../academic-session/entities/academic-session.entity'
import { Term } from '../../academic-term/entities/term.entity'
import { Subject } from '../../subject/entities/subject.entity'

import { QuizQuestion } from './quiz-question.entity'
import { QuizSubmission } from './quiz-submission.entity'

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false'
export type QuizStatus = 'draft' | 'published' | 'closed'

/**
 * Quiz Entity
 *
 * Represents a quiz/assessment created by a teacher for a specific class.
 * Contains all quiz metadata, questions, and submissions.
 */
@Unique(['id', 'class_id', 'term_id', 'session_id'])
@Entity('quizzes')
export class Quiz extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacher_id: string

  @ManyToOne(() => Teacher, { nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher

  @Column({ name: 'class_id', type: 'uuid' })
  class_id: string

  @ManyToOne(() => Class, { nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: Class

  @Column({ name: 'subject_id', type: 'uuid', nullable: true })
  subject_id?: string

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject

  @Column({ name: 'term_id', type: 'uuid' })
  term_id: string

  @ManyToOne(() => Term, { nullable: false })
  @JoinColumn({ name: 'term_id' })
  term: Term

  @Column({ name: 'session_id', type: 'uuid' })
  session_id: string

  @ManyToOne(() => AcademicSession, { nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession

  @Column({ type: 'varchar', length: 50, default: 'published' })
  status: QuizStatus

  @Column({ type: 'int', default: 30 })
  time_limit_minutes: number

  @Column({ type: 'timestamp' })
  due_date: Date

  @Column({ type: 'boolean', default: false })
  show_answers: boolean

  @Column({ type: 'boolean', default: true })
  shuffled_questions: boolean

  @OneToMany(() => QuizQuestion, (q) => q.quiz, { cascade: true, eager: true })
  questions: QuizQuestion[]

  @OneToMany(() => QuizSubmission, (sub) => sub.quiz, { cascade: true })
  submissions: QuizSubmission[]

  @Column({ type: 'int', default: 0 })
  total_submissions: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject_name?: string
}
