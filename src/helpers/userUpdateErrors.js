///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { 
    authUserIdCheck, 
    emailValidCheck, 
    nameFirstValidCheck, 
    nameLastValidCheck 
} from './checkForErrors.js';

import { getData } from '../dataStore.js';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;
const NOT_FOUND = 'undefined';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FUNCTIONS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

/**
  * Check updated details of a user for any errors
  * 
  * @param {integer} authUserId - The user's unique id
  * @param {integer} email - The user's current or updated email
  * @param {string} nameFirst - The user's current or updated first name
  * @param {string} nameLast - The user's current or updated last name
  * 
  * @returns {object || number} - Returns either an error object or NO_ERROR (0)
*/
function checkDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    const data = getData();

    let error = authUserIdCheck(authUserId);
    if (error !== NO_ERROR) return error;

    const userWithEmail = data['users'].find(user => user.email === email);
    if (typeof userWithEmail !== NOT_FOUND && userWithEmail.userId !== authUserId) {
        return { error: 'email already in use' };
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

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export { checkDetailsUpdate };

