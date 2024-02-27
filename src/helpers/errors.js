/*
* Errors object that contains an organised list of errors.
* It also contains a method for throwing said error.
* To call: error.throwError('errorValue');
*/
const error = {
    listOfErrors: {
        // USER ID ERRORS:
        invalidUser: 'Not a valid AuthUserId.',

        // EMAIL ERRORS: 
        duplicateEmail: 'Email already being used.',
        invalidEmail: 'Email is not valid.',

        // NAME ERRORS: 
        nameFirstInvalid: 'First name contains characters other than lowercase, uppercase, spaces, hyphens or apostrophes.',
        nameLastInvalid: 'Last name contains characters other than lowercase, uppercase, spaces, hyphens or apostrophes.',
        nameFirstOutOfRange: 'First name length must be >= 2 and <= 20.',
        nameLastOutOfRange: 'Last name length must be >= 2 and <= 20.',

        // PASSWORD UPDATE OR CREATE ERRORS:
        incorrectOldPassword: 'Old password is incorrect.',
        identicalPassword: 'New password is the same as old password.',
        usedPassword: 'New password has already been used before.',
        shortPassword: 'Password is less than 8 characters.',
        easyPassword: 'Password does not contain at least one number and one letter.',
    },
    throwError: function(errorValue) {
        if (typeof errorValue !== 'string') {
            console.log('======================================');
            console.log('                                      ');
            console.log('ERROR: INCOMPATIBLE `errorValue` TYPE!');
            console.log('       MUST BE PASSED AS A STRING.... ');
            console.log('                                      ');
            console.log('TYPE PASSED:', typeof errorValue       );
            console.log('VALUE:', errorValue                    );
            console.log('                                      ');
            console.log('======================================');
            throw new Error("Fatal error thrown while in errors.js! Check above for details.");
        }
        if (`${errorValue}` in this.listOfErrors) {
            return {error: this.listOfErrors[`${errorValue}`]};
        } else {
            return {error: 'Error unknown.'};
        }
    }
}
 
export { error };
