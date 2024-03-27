/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getData, setData } from './dataStore';
import { isValidUser, isValidQuiz, isOwner } from './helpers/checkForErrors';
import { Question, ErrorObject, Quiz } from './interface';
import { getTrash, setTrash } from './trash';
import { QuestionBody } from './interface';
import { quizQuestionCreateChecker } from './helpers/quiz/quizQuestionCreateErrors';
import { getCurrentTime, findQuestion, findQuiz, generateAnswers, generateQuestionId } from './helpers/quiz/quizMiscHelpers';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////// LOCAL INTERFACES /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

interface OwnedQuizObject {
  quizId: number;
  name: string;
}

export interface AdminQuizListReturn {
  quizzes: OwnedQuizObject[];
}

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
  questions: Question[];
}

type EmptyObject = Record<string, never>

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
  * @returns {empty object} - Returns an empty object to the user
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
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quizToRemove = data.quizzes[quizIndex];
  quizToRemove.timeLastEdited = Math.floor(Date.now() / 1000);
  const trash = getTrash();
  trash.quizzes.push(quizToRemove);
  setTrash(trash);
  data.quizzes.splice(quizIndex, 1);
  setData(data);

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
function adminQuizCreate(authUserId: number, name: string, description: string): AdminQuizCreateReturn | ErrorObject {
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
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
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
    console.log(ExtantQuizId);
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
  * @returns {object} - Returns object containing details such as quizId, name, time made and edited, and description
*/
function adminQuizInfo(authUserId: number, quizId: number): AdminQuizInfoReturn | ErrorObject {
  if (!isValidUser(authUserId)) {
    return { error: 'Not a valid authUserId.' };
  }
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
function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): EmptyObject | ErrorObject {
  if (!isValidUser(authUserId)) {
    return { error: 'Not a valid authUserId.' };
  }
  if (!isValidQuiz(quizId)) {
    return { error: 'INVALID QUIZ: Not a valid quizId.' };
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'INVALID QUIZ: Quiz ID does not refer to a quiz that this user owns.' };
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

  const currentQuiz = usersQuizzes.find(q => q.quizId === quizId);
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
function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): EmptyObject | ErrorObject {
  const data = getData();
  const user = data.users.find(u => u.userId === authUserId);
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (user === undefined) {
    return { error: 'not a valid user' };
  }

  if (quiz === undefined) {
    return { error: 'not a valid quiz' };
  }

  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  if (description.length > 100) {
    return { error: 'Description length is too long' };
  }

  quiz.description = description;

  return {};
}

function adminQuizTransfer(quizId: number, userId: number, userEmail: string): EmptyObject | ErrorObject {
  const data = getData();
  const quizTransfer = data.quizzes.find((q) => q.quizId === quizId);
  const newOwner = data.users.find(user => user.email === userEmail);

  if (quizTransfer === undefined) {
    return { error: 'Quiz not found' };
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

// Implementation for the 'adminQuizTrashView' function
function adminQuizTrashView (userId: number) {
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
  * Update a question within a quiz
  *
  * @param {integer} userId - ID of a user
  * @param {integer} quizId - ID of a quiz
  * @param {object} questionBody - Key details of question passed in body of request
  *
  * @returns {object} - Returns an empty object
*/
function adminQuizQuestionCreate(userId: number, quizId: number, questionBody: QuestionBody) {
  const data = getData();
  const quiz = findQuiz(data.quizzes, quizId);
  if (typeof quiz === 'undefined') return { error: 'Invalid quiz', statusValue: 403 };

  const error = quizQuestionCreateChecker(userId, quiz, questionBody);
  if ('error' in error) return error;

  // Increment number of questions and update the edit time
  quiz.numQuestions++;
  quiz.timeLastEdited = getCurrentTime();

  // Generates new answers array, with added colour and answerId
  const answers = generateAnswers(questionBody.answers);
  const questionId = generateQuestionId(quiz);

  // Push new question containing above data into the questions array
  quiz.questions.push({
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answers
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
function adminQuizQuestionUpdate(userId: number, quizId: number, questionId: number, questionBody: QuestionBody): ErrorObject | EmptyObject {
  const data = getData();

  const quiz = findQuiz(data.quizzes, quizId);
  if (typeof quiz === 'undefined') return { error: 'Invalid quiz', statusValue: 403 };

  const question = findQuestion(quiz.questions, questionId);
  if (typeof question === 'undefined') return { error: 'Invalid question' };

  // Error checks are mostly the exact same as create function, so this can be re-used
  const error = quizQuestionCreateChecker(userId, quiz, questionBody);
  if ('error' in error) return error;

  quiz.timeLastEdited = getCurrentTime();
  const answers = generateAnswers(questionBody.answers);

  // Sets all the new data for the question
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = answers;

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
function adminQuizQuestionDelete(authUserId: number, quizId: number, questionId: number): EmptyObject | ErrorObject {
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
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  const quiz: Quiz = data.quizzes[quizIndex];
  const questionIndex = quiz.questions.findIndex((question) => question.questionId === questionId);
  if (questionIndex === -1) {
    return { error: 'Question Id does not refer to a valid question within this quiz.' };
  }

  quiz.questions.splice(questionIndex, 1);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}

/**
 * Duplicate a particular question to immediately after where the source question is.
 *
 * @param {number} authUserId - The ID of the authenticated user.
 * @param {number} quizId - The ID of the quiz containing the source question.
 * @param {number} sourceQuestionId - The ID of the source question to be duplicated.
 * @returns {EmptyObject | ErrorObject} - Returns an empty object on success or an error object on failure.
 */
function adminQuizQuestionDuplicate(authUserId: number, quizId: number, sourceQuestionId: number): {newQuestionId: number} | ErrorObject {
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
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  const quiz: Quiz = data.quizzes[quizIndex];
  const sourceQuestionIndex = quiz.questions.findIndex((question) => question.questionId === sourceQuestionId);
  if (sourceQuestionIndex === -1) {
    return { error: 'Source Question Id does not refer to a valid question within this quiz.' };
  }

  const duplicatedQuestion = { ...quiz.questions[sourceQuestionIndex] };
  duplicatedQuestion.questionId = generateQuestionId(quiz);
  quiz.questions.splice(sourceQuestionIndex + 1, 0, duplicatedQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  const newQuestionId = duplicatedQuestion.questionId;
  return { newQuestionId: newQuestionId };
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
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionDelete,
  adminQuizQuestionDuplicate,
  adminQuizTransfer
};
