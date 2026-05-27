import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common'
import { Roles } from '../../../modules/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../../modules/auth/guards/roles.guard'
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from '../dto/create-quiz.dto'
import { QuizService } from '../services/quiz.service'

interface IRequestWithUser extends Request {
  user?: {
    sub: string
    email: string
    role: string[]
    teacher_id?: string
  }
}

@Controller('quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  /**
   * GET /quizzes/student/:studentId
   * Get all quizzes available for a student
   */
  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  async getStudentQuizzes(@Param('studentId') studentId: string) {
    // TODO: Fetch student's class_id from database
    // For now, we'll assume it's passed in query params or from student record
    const classId = 'class-123' // This should come from student record
    const termId = 'term-id'
    const sessionId = 'session-id'

    const data = await this.quizService.getStudentQuizzes(studentId, classId, termId, sessionId)
    return {
      status_code: 200,
      message: null,
      data,
    }
  }

  /**
   * GET /quizzes/:quizId
   * Get a single quiz
   */
  @Get(':quizId')
  @UseGuards(JwtAuthGuard)
  async getQuiz(@Param('quizId') quizId: string) {
    const data = await this.quizService.getQuiz(quizId)
    if (!data) {
      return {
        status_code: 404,
        message: 'Quiz not found',
        data: null,
      }
    }
    return {
      status_code: 200,
      message: null,
      data,
    }
  }

  /**
   * POST /quizzes
   * Create a new quiz (Teachers only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @Req() req: IRequestWithUser) {
    const teacherId = req.user?.teacher_id || req.user?.sub
    const data = await this.quizService.createQuiz(teacherId, createQuizDto)
    return {
      status_code: 201,
      message: 'Quiz created successfully',
      data,
    }
  }

  /**
   * PUT /quizzes/:quizId
   * Update a quiz (Teachers only)
   */
  @Put(':quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async updateQuiz(@Param('quizId') quizId: string, @Body() updateQuizDto: UpdateQuizDto) {
    const data = await this.quizService.updateQuiz(quizId, updateQuizDto)
    return {
      status_code: 200,
      message: 'Quiz updated successfully',
      data,
    }
  }

  /**
   * DELETE /quizzes/:quizId
   * Delete a quiz (Teachers only)
   */
  @Delete(':quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  async deleteQuiz(@Param('quizId') quizId: string) {
    const data = await this.quizService.deleteQuiz(quizId)
    return {
      status_code: 200,
      message: 'Quiz deleted successfully',
      data,
    }
  }

  /**
   * POST /quiz-submissions
   * Submit a quiz
   */
  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(@Body() submitQuizDto: SubmitQuizDto) {
    const data = await this.quizService.submitQuiz(submitQuizDto)
    return {
      status_code: 201,
      message: 'Quiz submitted successfully',
      data,
    }
  }

  /**
   * GET /quiz-submissions/:submissionId
   * Get submission details
   */
  @Get('submissions/:submissionId')
  @UseGuards(JwtAuthGuard)
  async getSubmission(@Param('submissionId') submissionId: string) {
    const data = await this.quizService.getSubmission(submissionId)
    if (!data) {
      return {
        status_code: 404,
        message: 'Submission not found',
        data: null,
      }
    }
    return {
      status_code: 200,
      message: null,
      data,
    }
  }

  /**
   * GET /quiz-submissions/student/:studentId
   * Get all submissions for a student
   */
  @Get('submissions/student/:studentId')
  @UseGuards(JwtAuthGuard)
  async getStudentSubmissions(@Param('studentId') studentId: string) {
    const data = await this.quizService.getStudentSubmissions(studentId)
    return {
      status_code: 200,
      message: null,
      data,
    }
  }
}
