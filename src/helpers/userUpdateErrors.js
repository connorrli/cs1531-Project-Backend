import { checkForErrors } from './checkForErrors.js';

const NO_ERROR = 0;

function checkDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    const checks = new Map([
        [authUserId, ['authUserIdValid']],
        [email, ['emailValid', 'emailInUse']], 
        [nameFirst, ['nameFirstValid']],
        [nameLast, ['nameLastValid']]
    ]);

    for (const [key, value] of checks.entries()) {
        for (const check of value) {
            let error = checkForErrors(key, check);
            if (error !== NO_ERROR) return error;
        }
    }
    return NO_ERROR;
}

export { checkDetailsUpdate };

