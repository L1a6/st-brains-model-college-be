import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizController } from './controllers/quiz.controller';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizSubmission } from './entities/quiz-submission.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './services/quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizSubmission])],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
