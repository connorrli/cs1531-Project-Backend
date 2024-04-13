/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// IMPORTS HAVE BEEN COMMENTED OUT TO PASS LINTING,
// UNCOMMENT SPECIFIC IMPORTS ONCE THEY ARE REQUIRED PLEASE TY

import { checkDetailsUpdateV2 } from '../helpers/auth/userUpdateErrors';
import { checkUserPasswordUpdateV2 } from '../helpers/auth/userPasswordUpdateErrors';
import { getData } from '../data/dataStore';
import HTTPError from 'http-errors';

import {
  ErrorObject,
  // User,
  UserSession,
} from '../interface';
import { getHashOf } from '../helpers/hash';
import { passwordValidCheck } from '../helpers/checkForErrors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

type EmptyObject = Record<string, never>;
interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}
interface AdminUserDetailsReturn { user: UserDetails; }

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Given a token for a session, log out the associated user.
  *
  * @param {string} token - Unique token stored inside a session
  *
  * @returns {object} - Returns empty object if successful, otherwise error
*/
function adminAuthLogoutV2(session: UserSession): EmptyObject | ErrorObject {
  const data = getData();
  // const session = data.sessions; - This isn't being used yet ?

  const tokenLocate = data.sessions.userSessions.findIndex(index => index.token === session.token);
  data.sessions.userSessions.splice(tokenLocate, 1);
  return { };
}

/**
  * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
  *
  * @param {integer} authUserId - Stores user authentication and details about logins
  *
  * @returns {empty object} - Returns the user id number, name, email, count of successful logins and the times where the password has been entered incorrectly
*/
function adminUserDetailsV2 (authUserId: number): AdminUserDetailsReturn | ErrorObject {
  const data = getData();
  const userData = data.users.find(u => u.userId === authUserId);

  const user : UserDetails = {
    userId: userData.userId,
    name: userData.nameFirst + ' ' + userData.nameLast,
    email: userData.email,
    numSuccessfulLogins: userData.numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: userData.numFailedPasswordsSinceLastLogin,
  };

  return { user };
}

/**
  * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
  *
  * @param {object} session - Stores user authentication details after updating properties
  * @param {integer} email - Stores the user email after updating their properties
  * @param {string} nameFirst - Stores the first name of the logged in user after updating properties
  * @param {string} nameLast - Stores the last name of the logged in user after updating properties
  *
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserDetailsUpdateV2 (session: UserSession, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorObject {
  // Error check
  checkDetailsUpdateV2(session, email, nameFirst, nameLast);

  // Get and set new details
  const data = getData();
  const userData = data.users.find(user => user.userId === session.userId);

  userData.email = email;
  userData.nameFirst = nameFirst;
  userData.nameLast = nameLast;

  return { };
}

/**
  * Given details relating to a password change, updates the password of a logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} oldPassword - Stores the previous user password before the user changed it
  * @param {string} newPassword - Stores the new user password after the user changed it
  *
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserPasswordUpdateV2(session: UserSession, oldPassword: string, newPassword: string): EmptyObject | ErrorObject {
  const data = getData();
  const userData = data.users.find(user => user.userId === session.userId);

  oldPassword = getHashOf(oldPassword);
  const hashPassword: string = getHashOf(newPassword);

  checkUserPasswordUpdateV2(userData, oldPassword, hashPassword);

  const error: ErrorObject | number = passwordValidCheck(newPassword);
  if (error !== 0) {
    throw HTTPError(400, 'ERROR 400: Bad new password');
  }

  userData.password = hashPassword;
  userData.previousPasswords.push(oldPassword);

  return { };
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminAuthLogoutV2,
  adminUserDetailsV2,
  adminUserDetailsUpdateV2,
  adminUserPasswordUpdateV2
};
