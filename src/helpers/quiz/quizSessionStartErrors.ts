import { isOwner, isValidQuiz } from '../checkForErrors';
import HTTPError from 'http-errors';
import { findQuizV2 } from './quizMiscHelpers';
import { getData } from '../../data/dataStore';
import { States } from '../stateHandler';
import { getTrash } from '../../data/trash';

const MAX_AUTO_START_NUM = 50;
const MAX_ACTIVE_QUIZZES = 10;
const NO_QUESTIONS = 0;

export function quizSessionStartChecker(userId: number, quizId: number, autoStartNum: number): void {
  // Check if quiz is in trash and if user is owner of trashed quiz.
  const trashedQuiz = getTrash().quizzes.find(quiz => quiz.quizId === quizId);
  if (typeof trashedQuiz !== 'undefined') {
    if (trashedQuiz.quizOwner !== userId) {
      throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
    }
    throw HTTPError(400, 'ERROR 400: Quiz is currently in trash');
  }

  const quiz = findQuizV2(getData().quizzes, quizId);
  // Check if user owns quiz (if quiz doesn't exist, user can't own it)
  if (!isValidQuiz(quizId) || !isOwner(userId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  // Check if auto-start number is > 50 players joined
  if (autoStartNum > MAX_AUTO_START_NUM) {
    throw HTTPError(400, 'ERROR 400: Auto-start number is greater than 50');
  }

  // Check there aren't max number of active quizzes already running (10)
  let numActiveQuizzes = 0;
  for (const session of quiz.quizSessions) {
    if (session.state !== States.END) {
      numActiveQuizzes++;
    }

    if (numActiveQuizzes >= MAX_ACTIVE_QUIZZES) {
      throw HTTPError(400, 'ERROR 400: More than 10 sessions of this quiz are active');
    }
  }

  // Check quiz actually has questions
  if (quiz.questions.length === NO_QUESTIONS) {
    throw HTTPError(400, 'ERROR 400: Quiz has no questions');
  }
}
