import {
    error,
} from './errors.js';
import {
    getData,
    setData,
} from '../dataStore.js';
import validator from 'validator';


function checkForErrors(subject, errorType) {
    switch(errorType) {
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
            return 0;    
            break;
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
            return 0;    
            break;
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
            return 0;
            break;
        case 'emailValid':
            if (!validator.isEmail(subject)) {
                return error.throwError('invalidEmail');
            }
            return 0;
            break;
        
        default:
            return error.throwError(checkForErrorType);
    }
}

export {
    checkForErrors,
}