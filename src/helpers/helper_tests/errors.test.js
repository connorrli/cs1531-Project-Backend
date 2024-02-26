import { error } from '../errors.js'

// Testing for errors in errors.js. This has relatively simple code so hopefully we don't get errors thrown here.
describe("Error tests", () => {
    test('Testing invalidUser error:', () => {
        expect(error.throwError('invalidUser')).toEqual({error: 'Not a valid AuthUserId.'});
    });

    test('Testing duplicateEmail error:', () => {
        expect(error.throwError('duplicateEmail')).toEqual({error: 'Email already being used.'});
    });

    test('Testing nameFirstInvalid error:', () => {
        expect(error.throwError('nameFirstInvalid')).toEqual({error: 'First name contains characters other than lowercase, uppercase, spaces, hyphens or apostrophes.'});
    });

    test('Testing incorrectOldPassword error:', () => {
        expect(error.throwError('incorrectOldPassword')).toEqual({error: 'Old password is incorrect.'});
    });

    test('Testing non-existent error:', () => {
        expect(error.throwError('jumpingJacks')).toEqual({error: 'Error unknown.'});
    });
});
