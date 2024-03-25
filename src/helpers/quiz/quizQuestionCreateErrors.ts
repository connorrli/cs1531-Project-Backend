import { ErrorObject, QuestionBody, Quiz } from '../../interface';

// ALL CONSTANTS
type quizQuestionCreateCheckerReturn = Record<string, never>
const NO_ERROR = { };
const MIN_QUESTION_LEN = 5;
const MAX_QUESTION_LEN = 50;
const MIN_NO_ANSWERS = 2;
const MAX_NO_ANSWERS = 6;
const MIN_DURATION = 0;
const MIN_POINTS_AWARDED = 1;
const MAX_POINTS_AWARDED = 10;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 30;
const MINUTE = 60;

function quizQuestionCreateChecker(userId: number, quiz: Quiz, questionBody: QuestionBody): ErrorObject | quizQuestionCreateCheckerReturn {
  if (typeof quiz === 'undefined') return { error: 'Invalid Quiz', statusValue: 403 };
  else if (quiz.quizOwner !== userId) return { error: 'User is not owner of the quiz', statusValue: 403 };
  else if (questionBody.question.length < MIN_QUESTION_LEN) return { error: 'Question length < 5' };
  else if (questionBody.question.length > MAX_QUESTION_LEN) return { error: 'Question length > 50' };
  else if (questionBody.answers.length < MIN_NO_ANSWERS) return { error: 'Less than 2 answers' };
  else if (questionBody.answers.length > MAX_NO_ANSWERS) return { error: 'More than 6 answers' };
  else if (questionBody.duration <= MIN_DURATION) return { error: 'Invalid duration, must be positive' };
  else if (questionBody.points < MIN_POINTS_AWARDED) return { error: 'Less than 1 point awarded' };
  else if (questionBody.points > MAX_POINTS_AWARDED) return { error: 'More than 10 points awarded' };

  let duration = questionBody.duration;
  for (const question of quiz.questions) {
    duration += question.duration;
  }
  if (duration > MINUTE * 3) return { error: 'Duration is beyond 3 minutes' };

  for (const answerObj of questionBody.answers) {
    const isAlreadyAnswer = questionBody.answers.find(answer => answer.answer === answerObj.answer && answer !== answerObj);
    if (typeof isAlreadyAnswer !== 'undefined') return { error: 'Duplicate answers for current question' };

    const hasCorrectAnswer = questionBody.answers.find(answer => answer.correct === true);
    if (typeof hasCorrectAnswer === 'undefined') return { error: 'No correct answer for current question' };

    if (answerObj.answer.length < MIN_ANSWER_LENGTH) return { error: `'${answerObj.answer}' is shorter than 1 char` };
    else if (answerObj.answer.length > MAX_ANSWER_LENGTH) return { error: `'${answerObj.answer}' is longer than 30 chars` };
  }

  return NO_ERROR;
}

export { quizQuestionCreateChecker };
