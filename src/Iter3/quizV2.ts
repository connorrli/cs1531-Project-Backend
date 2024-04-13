/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// IMPORTS HAVE BEEN COMMENTED OUT TO PASS LINTING,
// UNCOMMENT SPECIFIC IMPORTS ONCE THEY ARE REQUIRED PLEASE TY

import { getData, setData } from '../data/dataStore';
import { isValidQuiz, isOwner } from '../helpers/checkForErrors';
import { QuestionBodyV2, QuestionV2, QuizV2, UserSession } from '../interface';
import { getTrash, setTrash } from '../data/trash';
import { quizQuestionCreateCheckerV2 } from '../helpers/quiz/quizQuestionCreateErrors';
import {
  findQuiz,
  // findQuestion,
  generateAnswers,
  generateQuestionId,
  findQuestionIndex,
  findQuizIndex,
  updateQuizDuration,
  findQuizV2,
  findQuestionV2,
  findQuizSession
} from '../helpers/quiz/quizMiscHelpers';
import { getCurrentTime } from '../helpers/globalHelpers';
import HTTPError from 'http-errors';
import { States, stateMachine } from '../helpers/stateHandler';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const INDEX_NOT_FOUND = -1;

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

export interface AdminQuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionV2[];
  duration: number;
  thumbnailUrl: string;
}

/**
 * Describes type for empty object.
 */
type EmptyObject = Record<string, never>

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
    quizSessions: [],
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

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns an empty object to the user
*/
function adminQuizRemoveV2(authUserId: number, quizId: number): EmptyObject {
  if (!isValidQuiz(quizId) || !isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const data = getData();
  const quizIndex = findQuizIndex(data.quizzes, quizId);
  const quizToRemove = data.quizzes[quizIndex];

  for (const session of quizToRemove.quizSessions) {
    if (session.state !== States.END) {
      throw HTTPError(400, 'ERROR 400: This quiz still has an active session');
    }
  }

  quizToRemove.timeLastEdited = getCurrentTime();
  const trash = getTrash();
  trash.quizzes.push(quizToRemove);
  setTrash(trash);
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return { };
}

/**
  * Given quizId, find and return information for that quiz
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns object containing details such as quizId,
  *                     name, time made and edited, and description
*/
function adminQuizInfoV2(authUserId: number, quizId: number): AdminQuizInfoReturn {
  if (!isValidQuiz(quizId) || !isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const quiz = getData().quizzes.find(quiz => quiz.quizId === quizId);

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl
  };
}

/**
  * Update the name of the relevant quiz.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * @param {string} name - Provides the name of the user who logged in for the quiz
  *
  * @returns {object} - Returns object containing nothing
*/
function adminQuizNameUpdateV2(
  authUserId: number,
  quizId: number,
  name: string
): EmptyObject {
  if (!isValidQuiz(quizId) || !isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    throw HTTPError(400, 'ERROR 400: Name contains invalid characters (not alphanumeric)');
  }
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'ERROR 400: Name must be between 3 and 30 characters long');
  }
  const data = getData();
  const allQuizzes = data.quizzes;
  const usersQuizzes = allQuizzes.filter(q => q.quizOwner === authUserId);
  const quizWithName = usersQuizzes.find(q => q.name === name);
  if (quizWithName !== undefined && quizWithName.quizId !== quizId) {
    throw HTTPError(400, 'ERROR 400: This name has already been used by logged in user');
  }

  const currentQuiz = findQuiz(usersQuizzes, quizId);
  currentQuiz.name = name;
  return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  *
  * @returns {empty object} - Returns an empty object to the user
*/
function adminQuizDescriptionUpdateV2(
  authUserId: number,
  quizId: number,
  description: string
): EmptyObject {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);

  if (quiz === undefined || !isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  if (description.length > 100) {
    throw HTTPError(400, 'ERROR 400: Description length is too long (>100)');
  }

  quiz.description = description;

  return {};
}

/**
  * Given an array of quiz ids, restore quizzes if possible.
  *
  * @param {integer} token - Unique session token
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns an empty object to the user
  *
*/
function adminQuizRestoreV2(session: UserSession, quizId: number): EmptyObject {
  const data = getData();
  const trash = getTrash();

  const findQuizIdTrash = trash.quizzes.find(quiz => quiz.quizId === quizId);
  const findQuizName = data.quizzes.find(quiz => quiz.name === findQuizIdTrash.name);

  // It should be okay to keep this ordering because quiz owner can't even be checked
  // if the quiz doesn't exist, making 400 the only returnable code.
  if (findQuizIdTrash === undefined) {
    throw HTTPError(400, 'ERROR 400: Quiz ID does not exist in trash');
  }
  if (findQuizIdTrash.quizOwner !== session.userId) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }
  if (findQuizName !== undefined) {
    throw HTTPError(400, 'ERROR 400: Quiz name is already in use');
  }

  const quizIndex = trash.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quizToRestore = trash.quizzes[quizIndex];

  quizToRestore.timeLastEdited = getCurrentTime();
  data.quizzes.push(quizToRestore);

  setData(data);

  trash.quizzes.splice(quizIndex, 1);

  setTrash(trash);

  return {};
}

/**
 * Transfers ownership of a quiz from one user to another based on email
 *
 * @param {number} quizId - ID of the quiz that is having ownership transferred
 * @param {number} userId - ID of the user who currently owns the quiz
 * @param {string} userEmail - Email of the user who is to gain ownership over quiz
 *
 * @returns {object} - Returns an error object or empty object
 */
function adminQuizTransferV2(
  quizId: number,
  userId: number,
  userEmail: string
): EmptyObject {
  const data = getData();
  const quizTransfer = findQuizV2(data.quizzes, quizId);
  const newOwner = data.users.find(user => user.email === userEmail);

  if (quizTransfer === undefined) {
    throw HTTPError(403, 'ERROR 403: Invalid quiz');
  }

  if (quizTransfer.quizOwner !== userId) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  if (newOwner === undefined) {
    throw HTTPError(400, 'ERROR 400: No user registered with given email');
  }

  if (newOwner.userId === userId) {
    throw HTTPError(400, 'ERROR 400: New owner is current owner');
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizOwner === newOwner.userId) {
      if (quiz.name === quizTransfer.name) {
        throw HTTPError(400, 'ERROR 400: New owner already has quiz with same name');
      }
    }
  }

  for (const session of quizTransfer.quizSessions) {
    if (session.state !== States.END) {
      throw HTTPError(400, 'ERROR 400: This quiz still has an active session');
    }
  }

  quizTransfer.quizOwner = newOwner.userId;

  return {};
}

/**
  * Update a question within a quiz
  *
  * @param {integer} userId - ID of a user
  * @param {integer} quizId - ID of a quiz
  * @param {string} questionId - ID of question within the given quiz
  * @param {object} questionBody - Key details of question passed in body of request
  *
  * @returns {object} - Returns an empty object
*/
function adminQuizQuestionUpdateV2(
  userId: number,
  quizId: number,
  questionId: number,
  questionBody: QuestionBodyV2
): EmptyObject {
  const data = getData();

  const quiz = findQuizV2(data.quizzes, quizId);
  if (typeof quiz === 'undefined') {
    throw HTTPError(403, 'ERROR 403: Invalid quiz');
  }

  const question = findQuestionV2(quiz.questions, questionId);
  if (typeof question === 'undefined') {
    throw HTTPError(400, 'ERROR 400: Invalid question');
  }

  // Error checks are mostly the exact same as create function, so this can be re-used
  quizQuestionCreateCheckerV2(userId, quiz, questionBody);

  quiz.timeLastEdited = getCurrentTime();

  // Sets all the new data for the question
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = generateAnswers(questionBody.answers);
  question.thumbnailUrl = questionBody.thumbnailUrl;
  updateQuizDuration(quiz);

  return {};
}

/**
 * Delete a question from the specified quiz.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz from which the question will be deleted.
 * @param {number} questionId - The ID of the question to be deleted.
 * @returns {EmptyObject | ErrorObject} - Returns an empty object on success or an error object on failure.
 */
function adminQuizQuestionDeleteV2(authUserId: number,
  quizId: number,
  questionId: number
): EmptyObject {
  if (!isValidQuiz(quizId)) {
    throw HTTPError(403, 'ERROR 403: Invalid quiz');
  }
  if (!isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const data = getData();
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  const quiz: QuizV2 = data.quizzes[quizIndex];
  const questionIndex = findQuestionIndex(quiz.questions, questionId);
  if (questionIndex === INDEX_NOT_FOUND) {
    throw HTTPError(400, 'ERROR 400: Invalid question');
  }

  for (const session of quiz.quizSessions) {
    if (session.state !== States.END) {
      throw HTTPError(400, 'ERROR 400: This quiz still has an active session');
    }
  }

  quiz.questions.splice(questionIndex, 1);
  quiz.numQuestions--;
  quiz.timeLastEdited = getCurrentTime();
  updateQuizDuration(quiz);
  setData(data);

  return {};
}

/**
 * Moves a question within a quiz from one index to another index
 *
 * @param {number} userId - The ID of the user performing the move.
 * @param {number} quizId - The ID of the quiz containing the question.
 * @param {number} questionId - The ID of the question to be moved
 * @param {number} newPos - The new position of the question (zero-indexed)
 *
 * @returns {object} - Returns an empty object on success, else an error object
 */
function adminQuizQuestionMoveV2(userId: number, quizId: number, questionId: number, newPos: number): EmptyObject {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);
  if (quiz === undefined) {
    throw HTTPError(403, 'ERROR 403: Invalid quiz');
  }

  if (!isOwner(userId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const qIndex = findQuestionIndex(quiz.questions, questionId);

  if (qIndex === INDEX_NOT_FOUND) {
    throw HTTPError(400, 'ERROR 400: Invalid question');
  }

  if (newPos >= quiz.questions.length || newPos < 0) {
    throw HTTPError(400, 'ERROR 400: Invalid new position provided');
  }

  const question = quiz.questions[qIndex];
  quiz.questions.splice(qIndex, 1);
  quiz.questions.splice(newPos, 0, question);
  quiz.timeLastEdited = getCurrentTime();
  return {};
}

/**
 * Duplicate a particular question to immediately after where the source question is.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz containing the source question.
 * @param {number} sourceQuestionId - The ID of the source question to be duplicated.
 * @returns {newQuestionId | ErrorObject} - Returns a newQuestionId on success or an error object on failure.
 */
function adminQuizQuestionDuplicateV2(authUserId: number, quizId: number, sourceQuestionId: number): {newQuestionId: number} {
  if (!isValidQuiz(quizId)) {
    throw HTTPError(403, 'ERROR 403: Invalid quiz');
  }
  if (!isOwner(authUserId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const data = getData();
  const quizIndex = findQuizIndex(data.quizzes, quizId);
  const quiz: QuizV2 = data.quizzes[quizIndex];
  const sourceQuestionIndex = findQuestionIndex(quiz.questions, sourceQuestionId);
  if (sourceQuestionIndex === INDEX_NOT_FOUND) {
    throw HTTPError(400, 'ERROR 400: Invalid question');
  }

  const duplicatedQuestion = { ...quiz.questions[sourceQuestionIndex] };
  duplicatedQuestion.questionId = generateQuestionId(quiz);
  quiz.questions.splice(sourceQuestionIndex + 1, 0, duplicatedQuestion);
  quiz.timeLastEdited = getCurrentTime();
  updateQuizDuration(quiz);
  quiz.numQuestions++;
  setData(data);
  const newQuestionId = duplicatedQuestion.questionId;
  return { newQuestionId };
}

function adminQuizSessionStateUpdate(
  userId: number, 
  quizId: number, 
  sessionId: number, 
  action: string
): EmptyObject {
  if (!isValidQuiz(quizId) || !isOwner(userId, quizId)) {
    throw HTTPError(403, 'ERROR 403: User is not owner of quiz');
  }

  const session = findQuizSession(quizId, sessionId);
  if (typeof session === 'undefined') {
    throw HTTPError(400, 'ERROR 400: Invalid quiz session');
  }

  const quiz = findQuizV2(getData().quizzes, quizId);
  stateMachine(quiz, session, action);

  return { };
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminQuizQuestionCreateV2,
  adminQuizListV2,
  adminQuizCreateV2,
  adminQuizRemoveV2,
  adminQuizInfoV2,
  adminQuizNameUpdateV2,
  adminQuizDescriptionUpdateV2,
  adminQuizRestoreV2,
  adminQuizTransferV2,
  adminQuizQuestionUpdateV2,
  adminQuizQuestionDeleteV2,
  adminQuizQuestionMoveV2,
  adminQuizQuestionDuplicateV2,
  adminQuizSessionStateUpdate,
};
