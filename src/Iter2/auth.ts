/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { checkDetailsUpdate } from '../helpers/auth/userUpdateErrors';
import { checkUserPasswordUpdate } from '../helpers/auth/userPasswordUpdateErrors';
import { getData, setData } from '../data/dataStore';
import { invalidRegConditions } from '../helpers/auth/registErrors';
import { error } from '../helpers/errors';
import { authUserIdCheck, passwordValidCheck } from '../helpers/checkForErrors';
import { generateSession } from '../helpers/sessionHandler';
import { getHashOf } from '../helpers/hash';

import {
  ErrorObject,
  User,
  UserSession,
} from '../interface';
/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

type EmptyObject = Record<string, never>;
interface AdminAuthRegisterReturn { token: string; }
interface AdminAuthLoginReturn { token: string; }
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
  * Given details relating to a password change, updates the password of a logged in user.
  *
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} oldPassword - Stores the previous user password before the user changed it
  * @param {string} newPassword - Stores the new user password after the user changed it
  *
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserPasswordUpdate(session: UserSession, oldPassword: string, newPassword: string): EmptyObject | ErrorObject {
  const data = getData();
  const userData = data.users.find(user => user.userId === session.userId);

  oldPassword = getHashOf(oldPassword);
  const hashPassword: string = getHashOf(newPassword);

  const error = checkUserPasswordUpdate(userData, oldPassword, hashPassword);
  if (typeof error !== 'number') return error;

  const valid = passwordValidCheck(newPassword);
  if (valid !== 0) {
    return { error: 'new password is invalid' };
  }

  userData.password = hashPassword;
  userData.previousPasswords.push(oldPassword);
  setData(data);

  return { };
}

/**
  * Registers a user with an email, password, and names, then returns their authUserId value.
  *
  * @param {string} email - Stores the user email as part of the registration
  * @param {string} password - Stores the user password as part of the registration
  * @param {string} nameFirst - Stores the user's first name as part of the registration
  * @param {string} nameLast - Stores the user's second name as part of the registration
  *
  * @returns {object} - Returns the authentication user id
*/
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): AdminAuthRegisterReturn | ErrorObject {
  email = email.toLowerCase();

  const error = invalidRegConditions(email, password, nameFirst, nameLast);
  if (error !== NO_ERROR) return error;

  password = getHashOf(password);

  const data = getData();
  const newUser : User = {
    userId: -1,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 1,
    previousPasswords: [],
    numFailedPasswordsSinceLastLogin: 0,
  };
  if (data.users.length === 0) {
    newUser.userId = 1;
    data.users.push(newUser);
  } else {
    let maxExtantId = 0;
    for (const extantUser of data.users) {
      if (extantUser.userId > maxExtantId) {
        maxExtantId = extantUser.userId;
      }
    }
    newUser.userId = maxExtantId + 1;
    data.users.push(newUser);
  }
  const token = generateSession(newUser.userId);
  return token;
}

/**
  * Given a registered user's email and password, returns their authUserId value.
  *
  * @param {integer} email - Stores the user email upon login
  * @param {integer} password - Stores the user password upon login
  *
  * @returns {object} - Returns the authentication user id
*/
function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn | ErrorObject {
  email = email.toLowerCase();
  const data = getData();
  const logger = (data.users).find(user => user.email === email);
  if (logger === undefined) {
    return error.throwError('noEmail');
  }

  password = getHashOf(password);

  if (password !== logger.password) {
    logger.numFailedPasswordsSinceLastLogin++;
    return error.throwError('wrongPassword');
  }
  logger.numSuccessfulLogins++;
  logger.numFailedPasswordsSinceLastLogin = 0;
  const token = generateSession(logger.userId);
  return token;
}

/**
  * Given a token for a session, log out the associated user.
  *
  * @param {string} token - Unique token stored inside a session
  *
  * @returns {object} - Returns empty object if successful, otherwise error
*/
function adminAuthLogout(session: UserSession): EmptyObject | ErrorObject {
  const data = getData();
  // const session = data.sessions; - This isn't being used yet ?

  const finder = session;
  if (finder === undefined) {
    return { error: 'There is no such user to log out' };
  }
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
function adminUserDetails (authUserId: number): AdminUserDetailsReturn | ErrorObject {
  if (authUserIdCheck(authUserId) !== NO_ERROR) {
    return error.throwError('invalidUser');
  }

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
function adminUserDetailsUpdate (session: UserSession, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorObject {
  // Error check
  const error = checkDetailsUpdate(session, email, nameFirst, nameLast);
  if (typeof error !== 'number') return error;

  // Get and set new details
  const data = getData();
  const userData = data.users.find(user => user.userId === session.userId);

  userData.email = email;
  userData.nameFirst = nameFirst;
  userData.nameLast = nameLast;
  setData(data);

  return { };
}
/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminAuthRegister,
  adminUserDetailsUpdate,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminUserDetails,
  adminAuthLogout,
};
