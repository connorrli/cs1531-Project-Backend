import {
    error,
} from './errors.js';
import {
    getData,
    setData,
} from '../dataStore.js';
import validator from 'validator';

/*Checks all conditions for a valid registration, returns false if the details
are valid, returns true if the details are invalid.
    * @param {string} email - The email input from user.
    * @param {string} password - Password input from user.
    * @param {string} nameFirst - First name input from user.
    * @param {string} nameLast - Last name input from user.
    * 
    * @returns Name of error (if error exists), otherwise returns 0
*/

function invalidRegConditions(email, password, nameFirst, nameLast) {
    if (nameFirst.length < 2 || nameFirst.length > 20) {
        return error.throwError('nameFirstOutOfRange');
    }
    if (nameLast.length < 2 || nameLast.length > 20) {
        return error.throwError('nameLastOutOfRange');
    }
    if (!validator.isEmail(email)) {
        return error.throwError('invalidEmail');
    }
    if (password.length < 8) {
        return error.throwError('shortPassword');
    }
    
    //checks if password has both numbers and letters. im sure theres a better way to do this that i will think of later
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
        return error.throwError('easyPassword');
    }

    for (let i = 0; i < nameFirst.length; i++) {
        let currChar = nameFirst.toLowerCase()[i];
        if (currChar > 'z' || currChar < 'a') {
            if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                return error.throwError('nameFirstInvalid');
            }
        }
    }
    for (let i = 0; i < nameLast.length; i++) {
        let currChar = nameLast.toLowerCase()[i];
        if (currChar > 'z' || currChar < 'a') {
            if (currChar !== ' ' && currChar !== '-' && currChar !== "'") {
                return error.throwError('nameLastInvalid');
            }
        }
    }


    return 0;
}

export {
    invalidRegConditions,
}