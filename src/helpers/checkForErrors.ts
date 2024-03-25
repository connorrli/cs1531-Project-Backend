/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { error } from './errors';
import { getData } from '../dataStore';
import validator from 'validator';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// Implementation of 'authUserIdCheck'
function authUserIdCheck(authUserId: number) {
  const data = getData();
  const theUser = data.users.find(user => user.userId === authUserId);
  if (typeof theUser === 'undefined') return error.throwError('invalidUser');
  return NO_ERROR;
}

// Implementation of 'nameFirstValidCheck'
function nameFirstValidCheck(nameFirst: string) {
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return error.throwError('nameFirstOutOfRange');
  }
  for (let i = 0; i < nameFirst.length; i++) {
    const currChar = nameFirst.toLowerCase()[i];
    if (currChar > 'z' || currChar < 'a') {
      if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
        return error.throwError('nameFirstInvalid');
      }
    }
  }
  return NO_ERROR;
}

// Implementation of 'nameLastValidCheck'
function nameLastValidCheck(nameLast: string) {
  if (nameLast.length < 2 || nameLast.length > 20) {
    return error.throwError('nameLastOutOfRange');
  }
  for (let i = 0; i < nameLast.length; i++) {
    const currChar = nameLast.toLowerCase()[i];
    if (currChar > 'z' || currChar < 'a') {
      if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
        return error.throwError('nameLastInvalid');
      }
    }
  }
  return NO_ERROR;
}

// Implementation of 'passwordValidCheck'
function passwordValidCheck(password: string) {
  if (password.length < 8) {
    return error.throwError('shortPassword');
  }
  let passHasNum = 0;
  let passHasLet = 0;
  for (let i = 0; i < 10; i++) {
    if (password.includes(`${i}`)) {
      passHasNum++;
    }
  }
  for (let i = 0; i < 27; i++) {
    if (password.toLowerCase().includes(String.fromCharCode(i + 97))) {
      passHasLet++;
    }
  }
  if (!(passHasNum * passHasLet)) {
    return error.throwError('easyPassword');
  }
  return NO_ERROR;
}

// Implementation of 'emailValidCheck'
function emailValidCheck(email: string) {
  if (!validator.isEmail(email)) {
    return error.throwError('invalidEmail');
  }
  return NO_ERROR;
}

// Returns true if quizId exists and false if quizId does not exist; 'isValidQuiz'
function isValidQuiz(quizId: number) {
  const data = getData();
  if (data.quizzes.length === 0) {
    return false;
  }
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  return !!quiz;
}

// Returns true if authUserId exists and false if authUserId does not exist; 'isValidUser'
function isValidUser(authUserId: number) {
  const data = getData();
  if (data.users.length === 0) {
    return false;
  }
  const user = data.users.find(u => u.userId === authUserId);
  return !!user;
}

// Returns true if authUserId owns quizId; returns false if authUserId is not
// the owner of quizId; 'isOwner'
function isOwner(authUserId: number, quizId: number) {
  const data = getData();
  if (data.users.length === 0) {
    return false;
  }
  if (data.quizzes.length === 0) {
    return false;
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (data.quizzes[quizIndex].quizOwner !== authUserId) {
    return false;
  }
  return true;
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  authUserIdCheck,
  nameFirstValidCheck,
  nameLastValidCheck,
  passwordValidCheck,
  emailValidCheck,
  isValidQuiz,
  isValidUser,
  isOwner,
};
