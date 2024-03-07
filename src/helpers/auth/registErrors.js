import {
    nameFirstValidCheck,
    nameLastValidCheck,
    passwordValidCheck,
    emailValidCheck,
} from '../checkForErrors.js';
import {
    error
} from '../errors.js';
import {
    getData
} from '../../dataStore.js';

const NO_ERROR = 0;

/*
 * Applies the checkForErrors cases relevant to adminAuthRegister.
 *
 * @param email, password, nameFirst, nameLast - exactly as they are in adminAuthRegister
 * 
 * @returns 0 for no errors, or an object with a relevant error msg if there is an error.
*/
function invalidRegConditions(email, password, nameFirst, nameLast) {
    if (nameFirstValidCheck(nameFirst) !== NO_ERROR) {
        return nameFirstValidCheck(nameFirst);
    }
    if (nameLastValidCheck(nameLast) !== NO_ERROR) {
        return nameLastValidCheck(nameLast);
    }
    if (emailValidCheck(email) !== NO_ERROR) {
        return emailValidCheck(email);
    }
    if (passwordValidCheck(password) !== NO_ERROR) {
        return passwordValidCheck(password);
    }

    const data = getData();
    for (const extantUser of data.users) {
        if (extantUser.email === email) {
            return error.throwError('duplicateEmail');
        }
    }
    return NO_ERROR;
}

export {
    invalidRegConditions,
}