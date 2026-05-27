import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

import { Quiz } from './quiz.entity';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';

/**
 * QuizQuestion Entity
 *
 * Represents an individual question within a quiz.
 */
@Entity('quiz_questions')
export class QuizQuestion extends BaseEntity {
  @Column({ name: 'quiz_id', type: 'uuid' })
  quiz_id: string;

  @ManyToOne(() => Quiz, (q) => q.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'int' })
  question_order: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 50 })
  type: QuestionType;

  @Column({ type: 'simple-array', nullable: true })
  options?: string[]; // for multiple choice and true/false

  @Column({ type: 'text' })
  correct_answer: string;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column({ type: 'text', nullable: true })
  explanation?: string;
}
