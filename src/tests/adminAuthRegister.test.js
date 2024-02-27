import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

beforeEach(() => {
    clear();
})


describe('Testing that registration is sucessful for valid registration attempts', () => {
    test('Should return an ID for a single valid registration', () => {
        const test1 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'John', 'Doe');
        expect(test1.authUserId).toBeDefined();
        expect(typeof test1.authUserId).toEqual('number');
    });

    test('Should return a different numeric ID for multiple valid registrations', () => {
        const test1 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'John', 'Doe');
        const test2 = adminAuthRegister('janedoe@genericemail.com', 'password123', 'Jane', 'Doe');
        const test3 = adminAuthRegister('zaphodbeeblebrox@space.com', 'password123', 'Zaphod', 'Beeblebrox');

        expect(typeof test1.authUserId).toEqual('number');
        expect(typeof test2.authUserId).toEqual('number');
        expect(typeof test3.authUserId).toEqual('number');

        expect(test1.authUserId).not.toEqual(test2.authUserId);
        expect(test2.authUserId).not.toEqual(test3.authUserId);
        expect(test3.authUserId).not.toEqual(test1.authUserId);
    });
});

describe('Testing that registration returns error if and only if attempts are invalid', () => {
    test('Should return an error, if email is invalid', () => {
        const test1 = adminAuthRegister('johndoe2genericemail.com', 'password123', 'John', 'Doe');
        expect(test1.error).toBeDefined;
        expect(typeof test1.error).toEqual('string');
    });

    test('Should return an error, if password is too short', () => {
        const test2 = adminAuthRegister('johndoe@genericemail.com', 'pass123', 'John', 'Doe');
        expect(test2.error).toBeDefined;
        expect(typeof test2.error).toEqual('string');
    });

    test('Should return an error, if password has no numbers', () => {
        const test3 = adminAuthRegister('johndoe@genericemail.com', 'password', 'John', 'Doe');
        expect(test3.error).toBeDefined;
        expect(typeof test3.error).toEqual('string');
    });

    test('Should return an error, if password has no letters', () => {
        const test4 = adminAuthRegister('johndoe@genericemail.com', '12345678', 'John', 'Doe');
        expect(test4.error).toBeDefined;
        expect(typeof test4.error).toEqual('string');
    });

    test('Should return an error, if first name is too short', () => {
        const test5 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'J', 'Doe');
        expect(test5.error).toBeDefined;
        expect(typeof test5.error).toEqual('string');
    });

    test('Should return an error, if first name is too long', () => {
        const test6 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'Johnnnnnnnnnnnnnnnnnnnnnyyyyyyyyyy', 'Doe');
        expect(test6.error).toBeDefined;
        expect(typeof test6.error).toEqual('string');
    });

    test('Should return an error, if last name is too short', () => {
        const test7 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'John', 'D');
        expect(test7.error).toBeDefined;
        expect(typeof test7.error).toEqual('string');
    });

    test('Should return an error, if last name is too long', () => {
        const test8 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'John', 'DoeRayMiFaSoLaTiDoeeeee');
        expect(test8.error).toBeDefined;
        expect(typeof test8.error).toEqual('string');
    });

    test('Should return an error, if email already in use', () => {
        const control = adminAuthRegister('johndoe@genericemail.com', 'password123', 'John', 'Doe');
        const test9 = adminAuthRegister('johndoe@genericemail.com', 'password123', "the REAL john", 'Doe');
        expect(test9.error).toBeDefined;
        expect(typeof test9.error).toEqual('string');
    });

    test('Should return an error, if name has special characters', () => {
        const test10 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'J0hhn', '#Doe[[[');
        expect(test10.error).toBeDefined;
        expect(typeof test10.error).toEqual('string');
    });

    test('Should not return an error if name has apostrophes, spaces and hyphens', () => {
        const test11 = adminAuthRegister('johndoe@genericemail.com', 'password123', "John Mc'Gee", 'Doe-seph');
        expect(test11.authUserId).toBeDefined();
    });

    test('Should return an error, if only first name has special characters', () => {
        const test10 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'Johhn6', 'Doe');
        expect(test10.error).toBeDefined;
        expect(typeof test10.error).toEqual('string');
    });
    test('Should return an error, if only last name has special characters', () => {
        const test10 = adminAuthRegister('johndoe@genericemail.com', 'password123', 'Johhn', 'Doe[');
        expect(test10.error).toBeDefined;
        expect(typeof test10.error).toEqual('string');
    });

});
