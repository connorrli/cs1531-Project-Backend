/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// IMPORTS HAVE BEEN COMMENTED OUT TO PASS LINTING,
// UNCOMMENT SPECIFIC IMPORTS ONCE THEY ARE REQUIRED PLEASE TY

// import { checkDetailsUpdate } from '../helpers/auth/userUpdateErrors';
// import { checkUserPasswordUpdate } from '../helpers/auth/userPasswordUpdateErrors';
import { getData } from '../data/dataStore';
import HTTPError from 'http-errors';
// import { invalidRegConditions } from '../helpers/auth/registErrors';
// import { error } from '../helpers/errors';
// import { authUserIdCheck } from '../helpers/checkForErrors';
// import { generateSession } from '../helpers/sessionHandler';


import {
  ErrorObject,
  // User,
  // UserSession,
} from '../interface';
import { authUserIdCheck } from '../helpers/checkForErrors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

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
function adminAuthLogoutV2(token: string): EmptyObject | ErrorObject {
  const data = getData();
  // const session = data.sessions; - This isn't being used yet ?

  if (token.length === 0) {
    throw HTTPError(401, `Token ${token} is invalid`);
  }
  const finder = (data.sessions).find(user => user.token === token);
  if (finder === undefined) {
    throw HTTPError(401, `Token ${token} is invalid`);
  }
  const tokenLocate = data.sessions.findIndex(index => index.token === token);
  data.sessions.splice(tokenLocate, 1);
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

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  adminAuthLogoutV2,
  adminUserDetailsV2,
}