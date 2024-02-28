import {
    checkForErrors
} from './checkForErrors.js';

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
    if (checkForErrors(email, 'emailInUse')) {
        return checkForErrors(email, 'emailInUse');
    }
    return 0;
}

export {
    invalidRegConditions,
}