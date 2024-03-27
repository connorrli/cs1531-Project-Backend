/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getData, setData } from './dataStore';
import { isValidUser, isValidQuiz, isOwner } from './helpers/checkForErrors';
import { Question, ErrorObject, Quiz } from './interface';
import { getTrash, setTrash } from './trash';
import { QuestionBody } from './interface';
import { quizQuestionCreateChecker } from './helpers/quiz/quizQuestionCreateErrors';
import {
  findQuiz,
  findQuestion,
  generateAnswers,
  generateQuestionId,
  findQuestionIndex,
  findQuizIndex
} from './helpers/quiz/quizMiscHelpers';
import { getCurrentTime } from './helpers/globalHelpers';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const INDEX_NOT_FOUND = -1;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

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

/**
 * Describes a returned trashed quiz object for viewing key details in front-end.
 */
interface TrashedQuiz {
  quizId: number;
  name: string;
}

/**
 * Describes success return object for adminQuizTrashView.
 */
interface adminQuizTrashViewReturn {
  quizzes: TrashedQuiz[];
}

/**
 * Describes success return object for adminQuizQuestionCreate.
 */
interface adminQuizQuestionCreateReturn {
  questionId: number;
}

/**
 * Describes success return object for adminQuizInfo.
 */
export interface AdminQuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
}

/**
 * Describes error object for adminQuizRestore.
 */
interface QRErrorObject { error: string, statusCode: number}

interface NewErrorObj {
  error: string,
  statusCode: number
}

/**
 * Describes type for empty object.
 */
type EmptyObject = Record<string, never>

/**
 * Describes success return for adminQuizRestore. Is an empty object.
 */
type AdminQuizRestoreReturn = Record<string, never>;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  *
  * @returns {object} - Returns the quiz id number and name of the quiz
*/
function adminQuizList(authUserId: number): AdminQuizListReturn | ErrorObject {
  if (!isValidUser(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }
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
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns an empty object to the user
*/
function adminQuizRemove(authUserId: number, quizId: number): EmptyObject | ErrorObject {
  if (!isValidUser(authUserId)) {
    return { error: 'Not a valid authUserId.' };
  }
  if (!isValidQuiz(quizId)) {
    return { error: 'Not a valid quizId.' };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const data = getData();
  const quizIndex = findQuizIndex(data.quizzes, quizId);
  const quizToRemove = data.quizzes[quizIndex];
  quizToRemove.timeLastEdited = getCurrentTime();
  const trash = getTrash();
  trash.quizzes.push(quizToRemove);
  setTrash(trash);
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

/**
  * Given an array of quiz ids, restore quizzes if possible.
  *
  * @param {integer} token - Unique session token
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns an empty object to the user
*/
function adminQuizRestore(token: string, quizId: number): AdminQuizRestoreReturn | QRErrorObject {
  const data = getData();
  const trash = getTrash();

  const findToken = data.sessions.find(user => user.token === token);
  const findQuizIdTrash = trash.quizzes.find(quiz => quiz.quizId === quizId);
  const findQuizName = data.quizzes.find(quiz => quiz.name === findQuizIdTrash.name);

  if (findQuizIdTrash === undefined) {
    return { statusCode: 400, error: 'QuizId entered does not exist in trash' };
  }
  if ((findQuizIdTrash.quizOwner !== findToken.userId)) {
    return { statusCode: 403, error: 'Quiz is not owned by user' };
  }
  if (findQuizName !== undefined) {
    return { statusCode: 400, error: 'Quiz name is already in use' };
  }
  if (token.length === 0 || findToken === undefined) {
    return { statusCode: 401, error: 'Token is empty or invalid' };
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
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} name - Provides the name of the user who logged in for the quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  *
  * @returns {object} - Returns the quiz id number of the quiz
*/
function adminQuizCreate(
  authUserId: number,
  name: string,
  description: string
): AdminQuizCreateReturn | ErrorObject {
  const data = getData();

  // Invalid user Id
  if (!isValidUser(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Invalid character in name
  if (!name.match(/^[a-zA-Z0-9 ]+$/)) {
    return { error: 'Name contains an invalid character' };
  }

  // Quiz name < 3 characters
  if (name.length < 3) {
    return { error: 'Quiz name is < 3 characters' };
  }

  // Quiz name > 30 characters
  if (name.length > 30) {
    return { error: 'Quiz name is > 30 characters' };
  }

  // Quiz description > 100 characters
  if (description.length > 100) {
    return { error: 'Quiz description is > 100 characters' };
  }

  // Quiz name already in use
  for (const quizname of data.quizzes) {
    if (quizname.name === name && quizname.quizOwner === authUserId) {
      return { error: 'Quiz name is already in use' };
    }
  }

  const quiz : Quiz = {
    quizId: 0,
    quizOwner: authUserId,
    name,
    timeCreated: getCurrentTime(),
    timeLastEdited: getCurrentTime(),
    description,
    numQuestions: 0,
    questions: []
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
  * Given quizId, find and return information for that quiz
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  *
  * @returns {object} - Returns object containing details such as quizId,
  *                     name, time made and edited, and description
*/
function adminQuizInfo(authUserId: number, quizId: number): AdminQuizInfoReturn | ErrorObject {
  if (!isValidQuiz(quizId)) {
    return { error: 'Not a valid quizId.' };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const quiz : Quiz | undefined = getData().quizzes.find(quiz => quiz.quizId === quizId);

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
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
function adminQuizNameUpdate(
  authUserId: number,
  quizId: number,
  name: string
): EmptyObject | ErrorObject {
  if (!isValidQuiz(quizId)) {
    return { error: 'Not a valid quizId.', statusValue: 403 };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', statusValue: 403 };
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
  }
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long.' };
  }
  const data = getData();
  const allQuizzes = data.quizzes;
  const usersQuizzes = allQuizzes.filter(q => q.quizOwner === authUserId);
  const quizWithName = usersQuizzes.find(q => q.name === name);
  if (quizWithName !== undefined && quizWithName.quizId !== quizId) {
    return { error: 'Name is already used by the current logged in user for another quiz' };
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
function adminQuizDescriptionUpdate(
  authUserId: number,
  quizId: number,
  description: string
): EmptyObject | ErrorObject {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);

  if (quiz === undefined) {
    return { error: 'not a valid quiz', statusValue: 403 };
  }

  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', statusValue: 403 };
  }

  if (description.length > 100) {
    return { error: 'Description length is too long' };
  }

  quiz.description = description;

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
function adminQuizTransfer(
  quizId: number,
  userId: number,
  userEmail: string
): EmptyObject | ErrorObject {
  const data = getData();
  const quizTransfer = findQuiz(data.quizzes, quizId);
  const newOwner = data.users.find(user => user.email === userEmail);

  if (quizTransfer === undefined) {
    return { error: 'Quiz not found', statusValue: 403 };
  }

  if (quizTransfer.quizOwner !== userId) {
    return { error: 'User is not the owner of quiz', statusValue: 403 };
  }

  if (newOwner === undefined) {
    return { error: 'UserEmail is not a real user' };
  }

  if (newOwner.userId === userId) {
    return { error: 'New owner is the current owner' };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizOwner === newOwner.userId) {
      if (quiz.name === quizTransfer.name) {
        return { error: 'Duplicate quiz name for new owner' };
      }
    }
  }
  quizTransfer.quizOwner = newOwner.userId;

  return {};
}

/**
 * View quizzes owned by user currently in trash
 *
 * @param {number} userId - The ID of the user
 *
 * @returns {object} - Returns an object with an array containining trashed quizzes
 */
function adminQuizTrashView (userId: number): adminQuizTrashViewReturn {
  const trash = getTrash();
  const trashQuizzes = [];
  for (const trashedQuiz of trash.quizzes) {
    if (trashedQuiz.quizOwner === userId) {
      trashQuizzes.push({ quizId: trashedQuiz.quizId, name: trashedQuiz.name });
    }
  }
  return { quizzes: trashQuizzes };
}

/**
  * Create a question within a quiz
  *
  * @param {integer} userId - ID of a user
  * @param {integer} quizId - ID of a quiz
  * @param {object} questionBody - Key details of question passed in body of request
  *
  * @returns {object} - Returns an error or object containing questionId
*/
function adminQuizQuestionCreate(
  userId: number,
  quizId: number,
  questionBody: QuestionBody
): adminQuizQuestionCreateReturn | ErrorObject {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);
  if (typeof quiz === 'undefined') return { error: 'Invalid quiz', statusValue: 403 };

  const error = quizQuestionCreateChecker(userId, quiz, questionBody);
  if ('error' in error) return error as ErrorObject;

  // Increment number of questions and update the edit time
  quiz.numQuestions++;
  quiz.timeLastEdited = getCurrentTime();

  // Push new question containing above data into the questions array
  const questionId = generateQuestionId(quiz);
  quiz.questions.push({
    questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: generateAnswers(questionBody.answers)
  });

  return { questionId };
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
function adminQuizQuestionUpdate(
  userId: number,
  quizId: number,
  questionId: number,
  questionBody: QuestionBody
): ErrorObject | EmptyObject {
  const data = getData();

  const quiz = findQuiz(data.quizzes, quizId);
  if (typeof quiz === 'undefined') return { error: 'Invalid quiz', statusValue: 403 };

  const question = findQuestion(quiz.questions, questionId);
  if (typeof question === 'undefined') return { error: 'Invalid question' };

  // Error checks are mostly the exact same as create function, so this can be re-used
  const error = quizQuestionCreateChecker(userId, quiz, questionBody);
  if ('error' in error) return error;

  quiz.timeLastEdited = getCurrentTime();

  // Sets all the new data for the question
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = generateAnswers(questionBody.answers);

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
function adminQuizQuestionDelete(authUserId: number,
  quizId: number,
  questionId: number
): EmptyObject | ErrorObject {
  if (!isValidQuiz(quizId)) {
    return { error: 'Not a valid quizId.', statusValue: 403 };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', statusValue: 403 };
  }

  const data = getData();
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  const quiz: Quiz = data.quizzes[quizIndex];
  const questionIndex = findQuestionIndex(quiz.questions, questionId);
  if (questionIndex === INDEX_NOT_FOUND) {
    return { error: 'Question Id does not refer to a valid question within this quiz.' };
  }

  quiz.questions.splice(questionIndex, 1);
  quiz.timeLastEdited = getCurrentTime();
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
function adminQuizQuestionMove (userId: number, quizId: number, questionId: number, newPos: number): EmptyObject | NewErrorObj {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);
  if (quiz === undefined) {
    return {
      error: 'Quiz cannot be found from ID',
      statusCode: 403
    };
  }

  if (!isOwner(userId, quizId)) {
    return {
      error: 'User is not owner of this quiz.',
      statusCode: 403
    };
  }

  const qIndex = findQuestionIndex(quiz.questions, questionId);

  if (qIndex === INDEX_NOT_FOUND) {
    return {
      error: 'No such question in this quiz',
      statusCode: 400
    };
  }

  if (newPos >= quiz.questions.length || newPos < 0) {
    return {
      error: 'Improper new position',
      statusCode: 400
    };
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
function adminQuizQuestionDuplicate(authUserId: number, quizId: number, sourceQuestionId: number): {newQuestionId: number} | ErrorObject {
  if (!isValidQuiz(quizId)) {
    return { error: 'Not a valid quizId.', statusValue: 403 };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', statusValue: 403 };
  }

  const data = getData();
  const quizIndex = findQuizIndex(data.quizzes, quizId);
  const quiz: Quiz = data.quizzes[quizIndex];
  const sourceQuestionIndex = findQuestionIndex(quiz.questions, sourceQuestionId);
  if (sourceQuestionIndex === INDEX_NOT_FOUND) {
    return { error: 'Source Question Id does not refer to a valid question within this quiz.' };
  }

  const duplicatedQuestion = { ...quiz.questions[sourceQuestionIndex] };
  duplicatedQuestion.questionId = generateQuestionId(quiz);
  quiz.questions.splice(sourceQuestionIndex + 1, 0, duplicatedQuestion);
  quiz.timeLastEdited = getCurrentTime();
  setData(data);
  const newQuestionId = duplicatedQuestion.questionId;
  return { newQuestionId };
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTrashView,
  adminQuizRestore,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionDelete,
  adminQuizQuestionMove,
  adminQuizQuestionDuplicate,
  adminQuizTransfer
};
