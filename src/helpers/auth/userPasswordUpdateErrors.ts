/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { ErrorObject, User } from '../../interface';
import { passwordValidCheck } from '../checkForErrors';
import HTTPError from 'http-errors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Check updated password for a user for any errors
  *
  * @param {object} userData - The user's object within dataStore
  * @param {string} oldPassword - The user's current password
  * @param {string} newPassword - The user's new password
  *
  * @returns {object | number} - Returns either an error object or NO_ERROR (0)
*/
function checkUserPasswordUpdate(userData: User, oldPassword: string, newPassword: string): ErrorObject | number {
  let error : ErrorObject | number = NO_ERROR;

  if (oldPassword !== userData.password) {
    return { error: 'Old password is incorrect' };
  } else if (oldPassword === newPassword) {
    return { error: 'New password is the same as old password' };
  } else if (userData.previousPasswords.includes(newPassword)) {
    return { error: 'New password has already been used before' };
  }

  error = passwordValidCheck(newPassword);
  if (error !== NO_ERROR) return error;

  return NO_ERROR;
}

function checkUserPasswordUpdateV2(userData: User, oldPassword: string, newPassword: string): void {
  let error : ErrorObject | number = NO_ERROR;

  if (oldPassword !== userData.password) {
    throw HTTPError(400, 'ERROR 400: Old password is incorrect');
  } else if (oldPassword === newPassword) {
    throw HTTPError(400, 'ERROR 400: New password is the same as old password');
  } else if (userData.previousPasswords.includes(newPassword)) {
    throw HTTPError(400, 'ERROR 400: New password has already been used before');
  }

  error = passwordValidCheck(newPassword);
  if (error !== NO_ERROR) throw HTTPError(400, 'ERROR 400: New password is invalid');
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export { checkUserPasswordUpdate, checkUserPasswordUpdateV2 };
