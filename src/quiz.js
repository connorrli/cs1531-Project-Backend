///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { getData, setData } from './dataStore.js';
import { invalidRegConditions } from './helpers/auth/registErrors.js';
import { error } from './helpers/errors.js';
import { isValidUser, isValidQuiz, isOwner } from './helpers/checkForErrors.js';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// INSERT CONSTANTS HERE

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FUNCTIONS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * 
  * @returns {object} - Returns the quiz id number and name of the quiz
*/
function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
              quizId: 1,
              name: 'My Quiz',
            }
        ]
    };
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
function adminQuizCreate(authUserId, name, description) {
  return {
    quizId: 2
  };
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminQuizRemove(authUserId, quizId) {
  if (!isValidUser(authUserId)) {
    return {error: 'Not a valid authUserId.'};
  }
  if (!isValidQuiz(quizId)) {
    return {error: 'Not a valid quizId.'};
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const quizIndex = getData().quizzes.findIndex(quiz => quiz.quizId === quizId);
  getData().quizzes.splice(quizIndex, 1);

  return {};
}


/**
  * Given quizId, find and return information for that quiz
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * 
  * @returns {object} - Returns object containing details such as quizId, name, time made and edited, and description
*/
function adminQuizInfo(authUserId, quizId) {
  if (!isValidUser(authUserId)) {
    return {error: 'Not a valid authUserId.'};
  }
  if (!isValidQuiz(quizId)) {
    return {error: 'Not a valid quizId.'};
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const quiz = getData().quizzes.find(quiz => quiz.quizId === quizId);

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
function adminQuizNameUpdate(authUserId, quizId, name) {
  if (!isValidUser(authUserId)) {
    return {error: 'Not a valid authUserId.'};
  }
  if (!isValidQuiz(quizId)) {
    return {error: 'Not a valid quizId.'};
  }
  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
  }
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long.' };
  }
  const allQuizzes = getData().quizzes;
  const userOtherQuizzes = allQuizzes.filter(q => q.authUserId === authUserId && q.quizId !== quizId);
  const quizWithSameName = userOtherQuizzes.find(q => q.name === name);
  if (quizWithSameName) {
    return { error: 'Name is already used by the current logged in user for another quiz' };
  }

  const currentQuiz = allQuizzes.filter(q => q.authUserId === authUserId && q.quizId === quizId);
  currentQuiz[0].name = name;
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
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {};
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate
};
