import { adminUserDetailsUpdate, adminAuthRegister, adminAuthLogin } from '../auth.js';
import { error } from '../helpers/errors.js';
import { clear } from '../other.js';

describe('Testing adminUserDetailsUpdate function:', () => {
    beforeEach(() => {
        clear();
        const user1 = adminAuthRegister('z000000@ad.unsw.edu.au','Password123','John','Doe');
        const user2 = adminAuthRegister('z000001@ad.unsw.edu.au','Password321','Sally','Seashells');
        const user3 = 3;
    });

    // Assume that we have logged in.
    test('Valid changes:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000002@ad.unsw.edu.au', 'John', 'Burton')).toEqual({ });
    });

    test('Invalid authUserId:', () => {
        expect(adminUserDetailsUpdate(user3, 'z000002.com', 'John', 'Doe')).toEqual(error.throwError('invalidUser'));
    });

    test('Duplicate email:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000001@ad.unsw.edu.au', 'John', 'Doe')).toEqual(error.throwError('duplicateEmail'));
    });

    test('Invalid email:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000001.com', 'John', 'Doe')).toEqual(error.throwError('invalidEmail'));
    });

    test('First name invalid:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', '][', 'Doe')).toEqual(error.throwError('nameFirstInvalid'));
    });

    test('Last name invalid:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', '][')).toEqual(error.throwError('nameLastInvalid'));
    });
    
    test('First name too long:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'aaaaaaaaaaaaaaaaaaaaa', 'Doe')).toEqual(error.throwError('nameFirstOutOfRange'));
    });

    test('Last name too long:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', 'aaaaaaaaaaaaaaaaaaaaa')).toEqual(error.throwError('nameLastOutOfRange'));
    });

    test('First name too short:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'a', 'Doe')).toEqual(error.throwError('nameFirstOutOfRange'));
    });

    test('Last name too short:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', 'a')).toEqual(error.throwError('nameLastOutOfRange'));
    });
});
