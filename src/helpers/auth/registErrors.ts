import {
    nameFirstValidCheck,
    nameLastValidCheck,
    passwordValidCheck,
    emailValidCheck,
} from '../checkForErrors';
import {
    error
} from '../errors';
import {
    getData
} from '../../dataStore';
import { DataStore, ErrorObject } from '../../interface';

const NO_ERROR = 0;

/*
 * Applies the checkForErrors cases relevant to adminAuthRegister.
 *
 * @param email, password, nameFirst, nameLast - exactly as they are in adminAuthRegister
 * 
 * @returns 0 for no errors, or an object with a relevant error msg if there is an error.
*/
function invalidRegConditions(email: string, password: string, nameFirst: string, nameLast: string) {
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

    const data : DataStore = getData();
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