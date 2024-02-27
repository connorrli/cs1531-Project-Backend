import {
    checkForErrors
} from './checkForErrors.js';

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
    return 0;
}

export {
    invalidRegConditions,
}