/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// IMPORTS HAVE BEEN COMMENTED OUT TO PASS LINTING,
// UNCOMMENT SPECIFIC IMPORTS ONCE THEY ARE REQUIRED PLEASE TY

import { getData /* setData */ } from '../data/dataStore';
// import { isValidUser, isValidQuiz, isOwner } from '../helpers/checkForErrors';
// import { Question, ErrorObject, Quiz } from '../interface';
// import { getTrash, setTrash } from '../data/trash';
import { QuestionBodyV2 } from '../interface';
import { quizQuestionCreateCheckerV2 } from '../helpers/quiz/quizQuestionCreateErrors';
import {
  findQuiz,
  // findQuestion,
  generateAnswers,
  generateQuestionId,
  // findQuestionIndex,
  // findQuizIndex,
  updateQuizDuration
} from '../helpers/quiz/quizMiscHelpers';
import { getCurrentTime } from '../helpers/globalHelpers';
import HTTPError from 'http-errors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
 * Describes success return object for adminQuizQuestionCreate.
 */
interface adminQuizQuestionCreateReturn {
  questionId: number;
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Create a question within a quiz
  *
  * @param {integer} userId - ID of a user
  * @param {integer} quizId - ID of a quiz
  * @param {object} questionBody - Key details of question passed in body of request
  *
  * @returns {object} - Returns an error or object containing questionId
*/
function adminQuizQuestionCreateV2(
  userId: number,
  quizId: number,
  questionBody: QuestionBodyV2
): adminQuizQuestionCreateReturn {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);
  if (typeof quiz === 'undefined') throw HTTPError(403, 'ERROR 403: Invalid quiz');

  quizQuestionCreateCheckerV2(userId, quiz, questionBody);

  // Increment number of questions and update the edit time
  quiz.numQuestions++;
  quiz.timeLastEdited = getCurrentTime();

  // Push new question containing above data into the questions array
  const questionId = generateQuestionId(quiz);
  quiz.questions.push({
    questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: generateAnswers(questionBody.answers),
  });
  updateQuizDuration(quiz);

  return { questionId };
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminQuizQuestionCreateV2,
};
