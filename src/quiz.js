///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { getData, setData } from './dataStore.js';
import { invalidRegConditions } from './helpers/auth/registErrors.js';
import { error } from './helpers/errors.js';

import { isValidUser, isValidQuiz, isOwner, authUserIdCheck } from './helpers/checkForErrors.js';


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
function adminQuizList(authUserId) { //unsure on how to return quizId and quizName
  if (!isValidUser(authUserId)) {
    return {error: 'AuthUserId is not a valid user'};
  }
let data = getData();

const ownedQuizzes = [];

for (const quiz in data['quizzes']) {
  if (quiz['quizOwner'] === authUserId) {
    ownedQuizzes.push(quiz);
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
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} name - Provides the name of the user who logged in for the quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  * 
  * @returns {object} - Returns the quiz id number of the quiz
*/
function adminQuizCreate(authUserId, name, description) {
  let data = getData();

  // Invalid user Id
  if (!isValidUser(authUserId)) {
    return {error: 'AuthUserId is not a valid user'};
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
    if (quizname.name === name) {
      return { error: 'Quiz name is already in use' };
    }
  }

  const quiz = {
    quizId: 0,
    quizOwner: authUserId,
    name,
    timeCreated: Date(),
    timeLastEdited: Date(),
    description,
  }

  if (data.quizzes.length === 0) {
    quiz.quizId = 1,
    data.quizzes.push(quiz);
  } else {
    let ExtantQuizId = 0;
    for (const element of data.quizzes) {
      if (element.quizId > ExtantQuizId) {
        ExtantQuizId = element.quizId;
      }
    }
    quiz.quizId = ExtantQuizId + 1;
    data.quizzes.push(quiz);
  }
  
  return {
      quizId: quiz.quizId,
    };
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
  const data = getData();
  const user = data.users.find(u => u.userId === authUserId);
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  if (user === undefined) {
    return {error: "not a valid user"};
  }

  if (quiz === undefined) {
    return {error: "not a valid quiz"};
  }

  if (!isOwner(authUserId, quizId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  if (description.length > 100) {
      return { error: "Description length is too long" };
  }

  quiz.description = description;

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
