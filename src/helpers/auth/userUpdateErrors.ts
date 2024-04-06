/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import {
  emailValidCheck,
  nameFirstValidCheck,
  nameLastValidCheck
} from '../checkForErrors';

import { getData } from '../../data/dataStore';
import { User, UserSession } from '../../interface';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Check updated details of a user for any errors
  *
  * @param {object} session - A user's session
  * @param {integer} email - The user's current or updated email
  * @param {string} nameFirst - The user's current or updated first name
  * @param {string} nameLast - The user's current or updated last name
  *
  * @returns {object || number} - Returns either an error object or NO_ERROR (0)
*/
function checkDetailsUpdate(session: UserSession, email: string, nameFirst: string, nameLast: string) {
  const data = getData();

  let error;

  const userWithEmail : User | undefined = data.users.find(user => user.email === email);
  if (typeof userWithEmail !== 'undefined') {
    if (userWithEmail.userId !== session.userId) return { error: 'email already in use' };
  }

  error = emailValidCheck(email);
  if (error !== NO_ERROR) return error;

  error = nameFirstValidCheck(nameFirst);
  if (error !== NO_ERROR) return error;

  error = nameFirstValidCheck(nameFirst);
  if (error !== NO_ERROR) return error;

  error = nameLastValidCheck(nameLast);
  if (error !== NO_ERROR) return error;

  return NO_ERROR;
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export { checkDetailsUpdate };
