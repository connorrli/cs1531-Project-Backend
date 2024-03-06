///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { checkDetailsUpdate } from './helpers/auth/userUpdateErrors.js';
import { checkUserPasswordUpdate } from './helpers/auth/userPasswordUpdateErrors.js';
import { getData, setData } from './dataStore.js';
import { invalidRegConditions } from './helpers/auth/registErrors.js';
import { error } from './helpers/errors.js';
import { authUserIdCheck }  from './helpers/checkForErrors.js';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

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
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  const data = getData();
  const userData = data['users'].find(user => user.userId === authUserId);

  const error = checkUserPasswordUpdate(userData, oldPassword, newPassword);
  if (error !== NO_ERROR) return error;

  userData['password'] = newPassword;
  userData['previousPasswords'].push(oldPassword);
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
function adminAuthRegister(email, password, nameFirst, nameLast) {

  email = email.toLowerCase();

  if (invalidRegConditions(email, password, nameFirst, nameLast)) {
    return invalidRegConditions(email, password, nameFirst, nameLast);
  }

  const data = getData();
  const user = {
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
    user.userId = 1;
    data.users.push(user);
  } else {
    let maxExtantId = 0;
    for (const extantUser of data.users) {
      if (extantUser.userId > maxExtantId) {
        maxExtantId = extantUser.userId;
      }
    }
    user.userId = maxExtantId + 1;
    data.users.push(user);
  }


  return {
        authUserId: user.userId,
    };
}

/**
  * Given a registered user's email and password, returns their authUserId value.
  * 
  * @param {integer} email - Stores the user email upon login 
  * @param {integer} password - Stores the user password upon login
  * 
  * @returns {object} - Returns the authentication user id
*/
function adminAuthLogin(email, password) {
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
  return {
        authUserId: logger.userId
  };
}

/**
  * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
  * 
  * @param {integer} authUserId - Stores user authentication and details about logins
  * 
  * @returns {empty object} - Returns the user id number, name, email, count of successful logins and the times where the password has been entered incorrectly
*/
function adminUserDetails (authUserId) {
  if (authUserIdCheck(authUserId) !== NO_ERROR) {
    return error.throwError('invalidUser');
  }  
  const user = {userId: undefined, name: undefined, email: undefined, numSuccessfulLogins: undefined, numFailedPasswordsSinceLastLogin: undefined};

  const data = getData();
  const userData = data.users.find(u => u.userId === authUserId);
  user.userId = userData.userId;
  user.name = userData.nameFirst + ' ' + userData.nameLast;
  user.email = userData.email;
  user.numSuccessfulLogins = userData.numSuccessfulLogins;
  user.numFailedPasswordsSinceLastLogin = userData.numFailedPasswordsSinceLastLogin;
  return {
      user
  }
}

/**
  * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
  * 
  * @param {integer} authUserId - Stores user authentication details after updating properties
  * @param {integer} email - Stores the user email after updating their properties
  * @param {string} nameFirst - Stores the first name of the logged in user after updating properties
  * @param {string} nameLast - Stores the last name of the logged in user after updating properties
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {

    // Error check
    const error = checkDetailsUpdate(authUserId, email, nameFirst, nameLast);
    if (error !== NO_ERROR) return error;

    // Get and set new details
    const userData = getData();
    for (const user of userData['users']) {
        if (user['userId'] === authUserId) {
            user['email'] = email;
            user['nameFirst'] = nameFirst;
            user['nameLast'] = nameLast;
        }
    }
    setData(userData);

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
};