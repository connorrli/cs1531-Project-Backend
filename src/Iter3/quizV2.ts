/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// IMPORTS HAVE BEEN COMMENTED OUT TO PASS LINTING,
// UNCOMMENT SPECIFIC IMPORTS ONCE THEY ARE REQUIRED PLEASE TY

import { getData } from '../data/dataStore';
// import { isValidUser, isValidQuiz, isOwner } from '../helpers/checkForErrors';
import { ErrorObject, QuestionBodyV2, QuizV2 } from '../interface';
import { getTrash, /* setTrash */ } from '../data/trash';
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
// import { stateMachine, States, Actions } from '../helpers/stateHandler';
import HTTPError from 'http-errors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
 * Describes success return object for adminQuizQuestionCreate.
 */
interface adminQuizQuestionCreateReturn {
  questionId: number;
}

/**
 * Describes an owned quiz object, which shows key quiz details (quizId, name).
 */
interface OwnedQuizObject {
  quizId: number;
  name: string;
}

/**
 * Describes success return object for adminQuizList.
 */
export interface AdminQuizListReturn {
  quizzes: OwnedQuizObject[];
}

/**
 * Describes success return object for adminQuizCreate.
 */
interface AdminQuizCreateReturn {
  quizId: number;
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
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

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  *
  * @returns {object} - Returns the quiz id number and name of the quiz
*/
function adminQuizListV2(authUserId: number): AdminQuizListReturn {
  const data = getData();
  const ownedQuizzes : OwnedQuizObject[] = [];

  for (const quiz of data.quizzes) {
    if (quiz.quizOwner === authUserId) {
      const obj : OwnedQuizObject = { quizId: quiz.quizId, name: quiz.name };
      ownedQuizzes.push(obj);
    }
  }
  return { quizzes: ownedQuizzes };
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} name - Provides the name of the user who logged in for the quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  *
  * @returns {object} - Returns the quiz id number of the quiz
*/
function adminQuizCreateV2(
  authUserId: number,
  name: string,
  description: string
): AdminQuizCreateReturn {
  const data = getData();

  // Invalid character in name
  if (!name.match(/^[a-zA-Z0-9 ]+$/)) {
    throw HTTPError(400, 'Name contains an invalid character');
  }

  // Quiz name < 3 characters
  if (name.length < 3) {
    throw HTTPError(400, 'Quiz name is < 3 characters');
  }

  // Quiz name > 30 characters
  if (name.length > 30) {
    throw HTTPError(400, 'Quiz name is > 30 characters');
  }

  // Quiz description > 100 characters
  if (description.length > 100) {
    throw HTTPError(400, 'Quiz description is > 100 characters');
  }

  // Quiz name already in use
  for (const quizname of data.quizzes) {
    if (quizname.name === name && quizname.quizOwner === authUserId) {
      throw HTTPError(400, 'Quiz name is already in use');
    }
  }

  const quiz : QuizV2 = {
    quizId: 0,
    quizOwner: authUserId,
    name,
    timeCreated: getCurrentTime(),
    timeLastEdited: getCurrentTime(),
    description,
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
  };
  const trash = getTrash();

  if ((data.quizzes.length === 0) && (trash.quizzes.length === 0)) {
    quiz.quizId = 1;
    data.quizzes.push(quiz);
  } else {
    let ExtantQuizId = 0;
    for (const element of data.quizzes) {
      if (element.quizId > ExtantQuizId) {
        ExtantQuizId = element.quizId;
      }
    }
    for (const element of trash.quizzes) {
      if (element.quizId > ExtantQuizId) {
        ExtantQuizId = element.quizId;
      }
    }
    quiz.quizId = ExtantQuizId + 1;
    data.quizzes.push(quiz);
  }

  return { quizId: quiz.quizId };
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminQuizQuestionCreateV2,
  adminQuizListV2,
  adminQuizCreateV2,
};
