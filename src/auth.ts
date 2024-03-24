///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { checkDetailsUpdate } from './helpers/auth/userUpdateErrors';
import { checkUserPasswordUpdate } from './helpers/auth/userPasswordUpdateErrors';
import { getData, setData } from './dataStore';
import { invalidRegConditions } from './helpers/auth/registErrors';
import { error } from './helpers/errors';
import { authUserIdCheck }  from './helpers/checkForErrors';
import { getSession, generateSession } from './helpers/sessionHandler';

import { 
  ErrorObject,
  User,
  UserSession,
} from './interface';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// LOCAL INTERFACES /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

interface AdminUserPasswordUpdateReturn { }
interface AdminUserDetailsUpdateReturn { }
interface AdminAuthRegisterReturn { token: String; }
interface AdminAuthLoginReturn { token: String; }
interface AdminAuthLogoutReturn { };
interface UserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}
interface AdminUserDetailsReturn { user: UserDetails; }


///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FUNCTIONS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

/**
  * Given details relating to a password change, updates the password of a logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} oldPassword - Stores the previous user password before the user changed it
  * @param {string} newPassword - Stores the new user password after the user changed it
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserPasswordUpdate(session: UserSession, oldPassword: string, newPassword: string): AdminUserPasswordUpdateReturn | ErrorObject {

  const data = getData();
  const userData = data['users'].find(user => user.userId === session.userId);

  const error = checkUserPasswordUpdate(userData!, oldPassword, newPassword);
  if (error !== NO_ERROR) return error;

  userData!.password = newPassword;
  userData!.previousPasswords.push(oldPassword);
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
  }
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
  if (password !== logger.password) {
    logger.numFailedPasswordsSinceLastLogin++;
    return error.throwError('wrongPassword');
  }
  logger.numSuccessfulLogins++;
  logger.numFailedPasswordsSinceLastLogin = 0;
  const token = generateSession(logger.userId);
  return token;
}

function adminAuthLogout(token: string): AdminAuthLogoutReturn | ErrorObject {
  const data = getData();
  const session = data.sessions;

  if (token.length === 0) {
    return {error: 'Token is empty'};
  }
  const finder = (data.sessions).find(user => user.token === token);
  if (finder === undefined) {
    return {error: 'There is no such user to log out'};
  }
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
    userId: userData!.userId,
    name: userData!.nameFirst + ' ' + userData!.nameLast,
    email: userData!.email,
    numSuccessfulLogins: userData!.numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: userData!.numFailedPasswordsSinceLastLogin,
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
function adminUserDetailsUpdate (session: UserSession, email: string, nameFirst: string, nameLast: string): AdminUserDetailsUpdateReturn | ErrorObject {

  // Error check
  const error = checkDetailsUpdate(session, email, nameFirst, nameLast);
  if (error !== NO_ERROR) return error;

  // Get and set new details
  const data = getData();
  const userData = data.users.find(user => user.userId === session.userId);

  userData.email = email;
  userData.nameFirst = nameFirst;
  userData.nameLast = nameLast;
  setData(data);

  return { };
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
  adminAuthRegister,
  adminUserDetailsUpdate,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminUserDetails,
  adminAuthLogout,
};