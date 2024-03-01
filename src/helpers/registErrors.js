import {
    checkForErrors
} from './checkForErrors.js';
import {
    getData
} from '../dataStore.js';

const NO_ERROR = 0;

/*
 * Applies the checkForErrors cases relevant to adminAuthRegister.
 *
 * @param email, password, nameFirst, nameLast - exactly as they are in adminAuthRegister
 * 
 * @returns 0 for no errors, or an object with a relevant error msg if there is an error.
*/
function invalidRegConditions(email, password, nameFirst, nameLast) {
    if (checkForErrors(nameFirst, 'nameFirstValid')) {
        return checkForErrors(nameFirst, 'nameFirstValid');
    }
    if (checkForErrors(nameLast, 'nameLastValid')) {
        return checkForErrors(nameLast, 'nameLastValid');
    }
    if (checkForErrors(email, 'emailValid')) {
        return checkForErrors(email, 'emailValid');
    }
    if (checkForErrors(password, 'passwordValid')) {
        return checkForErrors(password, 'passwordValid');
    }
    
    data = getData();
    for (const extantUser of data.users) {
        if (extantUser.email === email) {
            return error.throwError(errors['duplicateEmail']);
        }
    }
    return NO_ERROR;
}

export {
    invalidRegConditions,
}