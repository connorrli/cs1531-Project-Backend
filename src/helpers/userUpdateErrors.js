///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { checkForErrors } from './checkForErrors.js';
import { getData } from '../dataStore.js';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

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
  * @returns {error object or NO_ERROR} - Returns either an error object or NO_ERROR (0)
*/
function checkDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    const data = getData();
    const checks = new Map([
        [authUserId, ['authUserIdValid']],
        [email, ['emailValid']], 
        [nameFirst, ['nameFirstValid']],
        [nameLast, ['nameLastValid']],
    ]);

    // Only check email is in use if it's not the user's current email
    const theUser = data['users'].find(user => user.userId === authUserId);
    if (theUser !== undefined) {
        if (theUser['email'] !== email) {
            checks.set(email, ['emailValid', 'emailInUse']);
        }
    }

    // Do all checks mapped to each user detail
    for (const [key, value] of checks.entries()) {
        for (const check of value) {
            let error = checkForErrors(key, check);
            if (error !== NO_ERROR) return error;
        }
    }
    return NO_ERROR;
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export { checkDetailsUpdate };

