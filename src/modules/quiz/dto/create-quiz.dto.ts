import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDateString,
  IsUUID,
  IsEnum,
} from 'class-validator';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';
export type QuizStatus = 'draft' | 'published' | 'closed';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(['multiple_choice', 'short_answer', 'true_false'])
  type: QuestionType;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsString()
  correct_answer: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsString()
  @IsOptional()
  explanation?: string;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  class_id: string;

  @IsUUID()
  @IsOptional()
  subject_id?: string;

  @IsUUID()
  term_id: string;

  @IsUUID()
  session_id: string;

  @IsDateString()
  due_date: string;

  @IsNumber()
  @IsOptional()
  time_limit_minutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @IsEnum(['draft', 'published', 'closed'])
  @IsOptional()
  status?: QuizStatus;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsNumber()
  @IsOptional()
  time_limit_minutes?: number;

  @IsEnum(['draft', 'published', 'closed'])
  @IsOptional()
  status?: QuizStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
}

export class SubmitQuizDto {
  @IsUUID()
  quiz_id: string;

  @IsUUID()
  student_id: string;

  @IsString()
  @Type(() => Object)
  answers: Record<string, string>;

  @IsNumber()
  @IsOptional()
  time_spent_seconds?: number;
}
