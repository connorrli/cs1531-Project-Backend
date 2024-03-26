/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getData, setData } from './dataStore';
import { isValidUser, isValidQuiz, isOwner } from './helpers/checkForErrors';
import { Answer, ErrorObject, Quiz } from './interface';
import { getTrash, setTrash } from './trash';
import { QuestionBody } from './interface';
import { quizQuestionCreateChecker } from './helpers/quiz/quizQuestionCreateErrors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const EMPTY = 0;
const FIRST_QUESTION_ID = 1;

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

interface AdminQuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
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
    description: quiz.description
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

function adminQuizQuestionCreate(userId: number, quizId: number, questionBody: QuestionBody) {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  const error = quizQuestionCreateChecker(userId, quiz, questionBody);
  if ('error' in error) return error;

  // Increment number of questions and update the edit time
  quiz.numQuestions++;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  // Generates new answers array, with added colour and answerId
  const answers : Answer[] = [];
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  let answerId = EMPTY;
  for (const answer of questionBody.answers) {
    const randIndex = Math.floor(Math.random() * colours.length);
    answerId += 1;
    answers.push({
      answerId,
      answer: answer.answer,
      colour: colours[randIndex],
      correct: answer.correct,
    });
    colours.splice(randIndex, 1);
  }

  // Determine New Question Id
  let questionId: number;
  if (quiz.questions.length === EMPTY) questionId = FIRST_QUESTION_ID;
  else {
    questionId = quiz.questions
      .reduce((max, question) => max.questionId > question.questionId ? max : question).questionId + 1;
  }

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
  adminQuizQuestionDelete,
};
