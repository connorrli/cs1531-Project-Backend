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
function checkForErrors(subject, errorType) {
    const data = getData();
    switch(errorType) {
        case 'authUserIdValid':
            const theUser = data['users'].find(user => user.userId === subject);
            if (theUser === undefined) return error.throwError('invalidUser');
            return 0;
        case 'nameFirstValid':
            if (subject.length < 2 || subject.length > 20) {
                return error.throwError('nameFirstOutOfRange');
            } 
            for (let i = 0; i < subject.length; i++) {
                let currChar = subject.toLowerCase()[i];
                if (currChar > 'z' || currChar < 'a') {
                    if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                        return error.throwError('nameFirstInvalid');
                    }
                }
            }
            return NO_ERROR;    
        case 'nameLastValid':
            if (subject.length < 2 || subject.length > 20) {
                return error.throwError('nameLastOutOfRange');
            } 
            for (let i = 0; i < subject.length; i++) {
                let currChar = subject.toLowerCase()[i];
                if (currChar > 'z' || currChar < 'a') {
                    if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                        return error.throwError('nameLastInvalid');
                    }
                }
            }
            return NO_ERROR;    
        case 'passwordValid': 
            if (subject.length < 8) {
                return error.throwError('shortPassword');
            }
            let passHasNum = 0;
            let passHasLet = 0;
            for (let i = 0; i < 10; i++) {
                if (subject.includes(`${i}`)) {
                    passHasNum++;
                }
            }
            for (let i = 0; i < 27; i++) {
                if (subject.toLowerCase().includes(String.fromCharCode(i + 97))) {
                    passHasLet++;
                }
            }
            if (!(passHasNum * passHasLet)) {
                return error.throwError('easyPassword');
            }
            return NO_ERROR;
        case 'emailValid':
            if (!validator.isEmail(subject)) {
                return error.throwError('invalidEmail');
            }
            return NO_ERROR;
        case 'emailInUse':
            for (const extantUser of data.users) {
                if (extantUser.email === subject) {
                    return error.throwError('duplicateEmail');
                }
            }
            return NO_ERROR;
        default:
            return error.throwError('checkForErrorType');
    }
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
    checkForErrors,
};