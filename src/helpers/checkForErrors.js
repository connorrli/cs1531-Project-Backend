///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { error } from './errors.js';
import { getData } from '../dataStore.js';
import validator from 'validator';

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// CONSTANTS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const NO_ERROR = 0;

// For easy referencing of errors (don't have to check errors.js)
const errors = error['listOfErrors'];
for (const key of Object.keys(errors)) {
    errors[key] = `${key}`;
}

///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// FUNCTIONS ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

/*
 * Switch statement that applies each unique error conditions to various error types.
 *
 * @param subject - the data to be checked for errors
 * @param errorType - the type of error (i.e. conditions) to be checked
 * 
 * @returns - 0 if no errors. If there is an error, will return an object with
 *              a relevant error msg.
*/
function authUserIdCheck(authUserId) {
    const data = getData();
    const theUser = data['users'].find(user => user.userId === authUserId);
    if (theUser === undefined) return error.throwError(errors['invalidUser']);
    return NO_ERROR;
}

function nameFirstValidCheck(nameFirst) {
    if (nameFirst.length < 2 || nameFirst.length > 20) {
        return error.throwError(errors['nameFirstOutOfRange']);
    } 
    for (let i = 0; i < nameFirst.length; i++) {
        let currChar = nameFirst.toLowerCase()[i];
        if (currChar > 'z' || currChar < 'a') {
            if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                return error.throwError(errors['nameFirstInvalid']);
            }
        }
    }
    return NO_ERROR;    
}

function nameLastValidCheck(nameLast) {
    if (nameLast.length < 2 || nameLast.length > 20) {
        return error.throwError(errors['nameLastOutOfRange']);
    } 
    for (let i = 0; i < nameLast.length; i++) {
        let currChar = nameLast.toLowerCase()[i];
        if (currChar > 'z' || currChar < 'a') {
            if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                return error.throwError(errors['nameLastInvalid']);
            }
        }
    }
    return NO_ERROR;    
}

function passwordValidCheck(password) {
    if (password.length < 8) {
        return error.throwError(errors['shortPassword']);
    }
    let passHasNum = 0;
    let passHasLet = 0;
    for (let i = 0; i < 10; i++) {
        if (password.includes(`${i}`)) {
            passHasNum++;
        }
    }
    for (let i = 0; i < 27; i++) {
        if (password.toLowerCase().includes(String.fromCharCode(i + 97))) {
            passHasLet++;
        }
    }
    if (!(passHasNum * passHasLet)) {
        return error.throwError(errors['easyPassword']);
    }
    return NO_ERROR;
}

function emailValidCheck(email) {
    if (!validator.isEmail(email)) {
        return error.throwError(errors['invalidEmail']);
    }
    return NO_ERROR;
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
    authUserIdCheck,
    nameFirstValidCheck,
    nameLastValidCheck,
    passwordValidCheck,
    emailValidCheck,
};