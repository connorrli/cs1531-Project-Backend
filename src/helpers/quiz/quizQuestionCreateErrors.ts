/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { ErrorObject, QuestionBody, QuestionBodyV2, Quiz } from '../../interface';
import HTTPError from 'http-errors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

type quizQuestionCreateCheckerReturn = Record<string, never>
const NO_ERROR = { };
const EMPTY = 0;
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

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Checks for all errors related to quiz question creation
  *
  * @param {number} userId - ID for a user
  * @param {object} quiz - Quiz object to add question to
  * @param {object} questionBody - Object containing core question data
  *
  * @returns {object} - Returns an error or empty object if no error
*/
function quizQuestionCreateChecker(
  userId: number,
  quiz: Quiz,
  questionBody: QuestionBody
): ErrorObject | quizQuestionCreateCheckerReturn {
  if (quiz.quizOwner !== userId) {
    return { error: 'User is not owner of the quiz', statusValue: 403 };
  } else if (questionBody.question.length < MIN_QUESTION_LEN) {
    return { error: 'Question length < 5' };
  } else if (questionBody.question.length > MAX_QUESTION_LEN) {
    return { error: 'Question length > 50' };
  } else if (questionBody.answers.length < MIN_NO_ANSWERS) {
    return { error: 'Less than 2 answers' };
  } else if (questionBody.answers.length > MAX_NO_ANSWERS) {
    return { error: 'More than 6 answers' };
  } else if (questionBody.duration <= MIN_DURATION) {
    return { error: 'Invalid duration, must be positive' };
  } else if (questionBody.points < MIN_POINTS_AWARDED) {
    return { error: 'Less than 1 point awarded' };
  } else if (questionBody.points > MAX_POINTS_AWARDED) {
    return { error: 'More than 10 points awarded' };
  }

  const duration = quiz.duration + questionBody.duration;
  if (duration > MINUTE * 3) return { error: 'Duration is beyond 3 minutes' };

  for (const answerObj of questionBody.answers) {
    const isAlreadyAnswer = questionBody.answers
      .find(answer => answer.answer === answerObj.answer && answer !== answerObj);
    if (typeof isAlreadyAnswer !== 'undefined') {
      return { error: 'Duplicate answers for current question' };
    }

    const hasCorrectAnswer = questionBody.answers
      .find(answer => answer.correct === true);
    if (typeof hasCorrectAnswer === 'undefined') {
      return { error: 'No correct answer for current question' };
    } else if (answerObj.answer.length < MIN_ANSWER_LENGTH) {
      return { error: `'${answerObj.answer}' is shorter than 1 char` };
    } else if (answerObj.answer.length > MAX_ANSWER_LENGTH) {
      return { error: `'${answerObj.answer}' is longer than 30 chars` };
    }
  }

  return NO_ERROR;
}

function quizQuestionCreateCheckerV2(
  userId: number,
  quiz: Quiz,
  questionBody: QuestionBodyV2
): void {
  // Check if calling user actualy owns the quiz
  if (quiz.quizOwner !== userId) {
    throw HTTPError(403, 'ERROR 403: User is not owner of the quiz');
  }

  // QUESTION PROPERTIES CHECKS

  // Check if question is within length constraints (5 <= x <= 50)
  if (questionBody.question.length < MIN_QUESTION_LEN) {
    throw HTTPError(400, 'ERROR 400: Question length < 5');
  } else if (questionBody.question.length > MAX_QUESTION_LEN) {
    throw HTTPError(400, 'ERROR 400: Question length > 50');
  }

  // Check if number of answers is within constraints (2 <= x <= 6)
  if (questionBody.answers.length < MIN_NO_ANSWERS) {
    throw HTTPError(400, 'ERROR 400: Less than 2 answers');
  } else if (questionBody.answers.length > MAX_NO_ANSWERS) {
    throw HTTPError(400, 'ERROR 400: More than 6 answers');
  }

  // Check if a negative duration has been provided
  if (questionBody.duration <= MIN_DURATION) {
    throw HTTPError(400, 'ERROR 400: Invalid duration, must be positive');
  }

  if (questionBody.points < MIN_POINTS_AWARDED) {
    throw HTTPError(400, 'ERROR 400: Less than 1 point awarded');
  } else if (questionBody.points > MAX_POINTS_AWARDED) {
    throw HTTPError(400, 'ERROR 400: More than 10 points awarded');
  }

  // Check if total duration is within constraints (0s <= x <= 180s)
  const duration = quiz.duration + questionBody.duration;
  if (duration > MINUTE * 3) throw HTTPError(400, 'ERROR 400: Duration is beyond 3 minutes');

  // ANSWERS ARRAY ERRORS
  for (const answerObj of questionBody.answers) {
    // Check if there are duplicate answers
    const isAlreadyAnswer = questionBody.answers
      .find(answer => answer.answer === answerObj.answer && answer !== answerObj);
    if (typeof isAlreadyAnswer !== 'undefined') {
      throw HTTPError(400, 'ERROR 400: Duplicate answers for current question');
    }

    // Check if there is a correct answer
    const hasCorrectAnswer = questionBody.answers
      .find(answer => answer.correct === true);
    if (typeof hasCorrectAnswer === 'undefined') {
      throw HTTPError(400, 'ERROR 400: No correct answer for current question');
    }

    // Check if answer is within length constraints
    if (answerObj.answer.length < MIN_ANSWER_LENGTH) {
      throw HTTPError(400, `ERROR 400: '${answerObj.answer}' is shorter than 1 char`);
    } else if (answerObj.answer.length > MAX_ANSWER_LENGTH) {
      throw HTTPError(400, `ERROR 400: '${answerObj.answer}' is longer than 30 chars`);
    }
  }

  // THUMBNAIL URL ERRORS
  const url = questionBody.thumbnailUrl;
  if (url.length === EMPTY) {
    throw HTTPError(400, 'Thumbnail URL is empty');
  } else if (!url.startsWith('https://') && !url.startsWith('http://')) {
    throw HTTPError(400, 'ERROR 400: Thumbnail URL does not start with https:// or http://');
  } else if (
    !url.endsWith('.jpeg') &&
    !url.endsWith('.jpg') &&
    !url.endsWith('.png')
  ) {
    throw HTTPError(400, 'ERROR 400: Thumbnail URL does not end with supported file type (jpeg, jpg, png)');
  }
}

export { quizQuestionCreateChecker, quizQuestionCreateCheckerV2 };
