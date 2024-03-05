import { passwordValidCheck } from "../checkForErrors";
import { error as errors } from '../errors.js';

const NO_ERROR = 0;

function checkUserPasswordUpdate(userData, oldPassword, newPassword) {
  let error = NO_ERROR;

  if (typeof userData === 'undefined') {
    return errors.throwError('invalidUser');;
  } else if (oldPassword !== userData['password']) { 
    return { error: 'Old password is incorrect' };
  } else if (oldPassword === newPassword) {
    return { error: 'New password is the same as old password' };
  } else if (userData['previousPasswords'].includes(newPassword)) {
    return { error: 'New password has already been used before' };
  }

  error = passwordValidCheck(newPassword);
  if (error !== NO_ERROR) return error;

  return NO_ERROR;
}

export { checkUserPasswordUpdate };