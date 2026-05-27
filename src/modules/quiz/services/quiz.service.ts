import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from '../dto/create-quiz.dto'
import { QuizQuestion } from '../entities/quiz-question.entity'
import { QuizSubmission } from '../entities/quiz-submission.entity'
import { Quiz } from '../entities/quiz.entity'

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private questionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizSubmission)
    private submissionRepository: Repository<QuizSubmission>,
  ) {}

  /**
   * Get all quizzes for a specific student's class
   */
  async getStudentQuizzes(studentId: string, classId: string, termId: string, sessionId: string) {
    // Get all published quizzes for the class
    const quizzes = await this.quizRepository.find({
      where: {
        class_id: classId,
        term_id: termId,
        session_id: sessionId,
        status: 'published',
      },
      relations: ['questions', 'teacher'],
      order: { createdAt: 'DESC' },
    })

    // Get student's submissions for these quizzes
    const quizIds = quizzes.map((q) => q.id)
    const submissions =
      quizIds.length > 0
        ? await this.submissionRepository.find({
            where: {
              student_id: studentId,
              quiz_id: In(quizIds),
            },
          })
        : []

    // Map submissions by quiz ID
    const submissionsMap = {}
    submissions.forEach((sub) => {
      submissionsMap[sub.quiz_id] = {
        id: sub.id,
        score: sub.score,
        maxScore: sub.max_score,
        submittedAt: sub.submitted_at,
        status: sub.status,
      }
    })

    return {
      quizzes: quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject_name || 'General',
        questions: quiz.questions
          .sort((a, b) => a.question_order - b.question_order)
          .map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correct_answer,
            points: q.points,
          })),
        timeLimitMinutes: quiz.time_limit_minutes,
        dueDate: quiz.due_date.toISOString(),
        createdBy: quiz.teacher_id,
        classId: quiz.class_id,
        term_id: quiz.term_id,
        session_id: quiz.session_id,
        status: quiz.status,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: quiz.updatedAt.toISOString(),
      })),
      submissions: submissionsMap,
      total: quizzes.length,
    }
  }

  /**
   * Get a single quiz by ID
   */
  async getQuiz(quizId: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions', 'teacher'],
    })

    if (!quiz) {
      return null
    }

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject_name || 'General',
      questions: quiz.questions
        .sort((a, b) => a.question_order - b.question_order)
        .map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correct_answer,
          points: q.points,
        })),
      timeLimitMinutes: quiz.time_limit_minutes,
      dueDate: quiz.due_date.toISOString(),
      createdBy: quiz.teacher_id,
      classId: quiz.class_id,
      term_id: quiz.term_id,
      session_id: quiz.session_id,
      status: quiz.status,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    }
  }

  /**
   * Create a new quiz
   */
  async createQuiz(teacherId: string, createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create({
      teacher_id: teacherId,
      class_id: createQuizDto.class_id,
      subject_id: createQuizDto.subject_id,
      term_id: createQuizDto.term_id,
      session_id: createQuizDto.session_id,
      title: createQuizDto.title,
      description: createQuizDto.description,
      due_date: new Date(createQuizDto.due_date),
      time_limit_minutes: createQuizDto.time_limit_minutes || 30,
      status: createQuizDto.status || 'draft',
      questions: [],
    })

    const savedQuiz = await this.quizRepository.save(quiz)

    // Create questions
    const questions = createQuizDto.questions.map((q, idx) =>
      this.questionRepository.create({
        quiz_id: savedQuiz.id,
        question_order: idx,
        text: q.text,
        type: q.type,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        explanation: q.explanation,
      })
    )

    await this.questionRepository.save(questions)

    return this.getQuiz(savedQuiz.id)
  }

  /**
   * Update a quiz
   */
  async updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto) {
    await this.quizRepository.update(quizId, {
      title: updateQuizDto.title,
      description: updateQuizDto.description,
      due_date: updateQuizDto.due_date ? new Date(updateQuizDto.due_date) : undefined,
      time_limit_minutes: updateQuizDto.time_limit_minutes,
      status: updateQuizDto.status,
    })

    // If questions are provided, update them
    if (updateQuizDto.questions && updateQuizDto.questions.length > 0) {
      // Delete old questions
      await this.questionRepository.delete({ quiz_id: quizId })

      // Create new questions
      const questions = updateQuizDto.questions.map((q, idx) =>
        this.questionRepository.create({
          quiz_id: quizId,
          question_order: idx,
          text: q.text,
          type: q.type,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points || 1,
          explanation: q.explanation,
        })
      )

      await this.questionRepository.save(questions)
    }

    return this.getQuiz(quizId)
  }

  /**
   * Submit a quiz
   */
  async submitQuiz(submitDto: SubmitQuizDto) {
    // Get the quiz with questions
    const quiz = await this.quizRepository.findOne({
      where: { id: submitDto.quiz_id },
      relations: ['questions'],
    })

    if (!quiz) {
      throw new Error('Quiz not found')
    }

    // Calculate score
    let score = 0
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0)

    quiz.questions.forEach((question) => {
      const answer = (submitDto.answers[question.id] || '').trim()
      const correctAnswer = (question.correct_answer || '').trim()

      if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
        score += question.points
      }
    })

    // Create submission record
    let submission = await this.submissionRepository.findOne({
      where: {
        quiz_id: submitDto.quiz_id,
        student_id: submitDto.student_id,
      },
    })

    if (!submission) {
      submission = this.submissionRepository.create({
        quiz_id: submitDto.quiz_id,
        student_id: submitDto.student_id,
      })
    }

    submission.answers = submitDto.answers
    submission.score = score
    submission.max_score = maxScore
    submission.status = 'submitted'
    submission.submitted_at = new Date()
    submission.time_spent_seconds = submitDto.time_spent_seconds || 0

    await this.submissionRepository.save(submission)

    // Update total submissions count
    const submissionCount = await this.submissionRepository.count({
      where: { quiz_id: submitDto.quiz_id },
    })
    await this.quizRepository.update(submitDto.quiz_id, { total_submissions: submissionCount })

    return {
      id: submission.id,
      score,
      maxScore,
      percentage: Math.round((score / Math.max(maxScore, 1)) * 100),
    }
  }

  /**
   * Get submission details
   */
  async getSubmission(submissionId: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['quiz', 'student'],
    })

    if (!submission) {
      return null
    }

    return {
      id: submission.id,
      quizId: submission.quiz_id,
      studentId: submission.student_id,
      answers: submission.answers,
      score: submission.score,
      maxScore: submission.max_score,
      status: submission.status,
      submittedAt: submission.submitted_at?.toISOString(),
      feedback: submission.feedback,
    }
  }

  /**
   * Get all submissions for a student
   */
  async getStudentSubmissions(studentId: string) {
    const submissions = await this.submissionRepository.find({
      where: { student_id: studentId },
      relations: ['quiz'],
      order: { submitted_at: 'DESC' },
    })

    return {
      submissions: submissions.map((sub) => ({
        id: sub.id,
        quizId: sub.quiz_id,
        score: sub.score,
        maxScore: sub.max_score,
        submittedAt: sub.submitted_at?.toISOString(),
        status: sub.status,
      })),
      total: submissions.length,
    }
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string) {
    await this.submissionRepository.delete({ quiz_id: quizId })
    await this.questionRepository.delete({ quiz_id: quizId })
    await this.quizRepository.delete({ id: quizId })
    return { message: 'Quiz deleted successfully' }
  }
}
