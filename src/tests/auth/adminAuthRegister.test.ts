
import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;
const TOKEN = { token: expect.any(String) };
const ERROR = { error: expect.any(String) };
beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', {qs: {} });
})

// 'authRegisterReq' function
const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

// Various success cases
describe('Testing that registration is sucessful for valid registration attempts', () => {
    test('Should return an ID for a single valid registration', () => {
        
        const test1 = authRegisterReq('john2313doe@genericemail.com', 'password123', 'John', 'Doe');
        expect(test1).toStrictEqual(TOKEN);
        
    });

    test('Should return a different session tokens for multiple valid registrations', () => {
        const test1 = authRegisterReq('johndoe@genericemail.com', 'password123', 'John', 'Doe');
        const test2 = authRegisterReq('janedoe@genericemail.com', 'password123', 'Jane', 'Doe');
        const test3 = authRegisterReq('zaphodbeeblebrox@space.com', 'password123', 'Zaphod', 'Beeblebrox');
        expect(test1).toStrictEqual(TOKEN);
        expect(test2).toStrictEqual(TOKEN);
        expect(test3).toStrictEqual(TOKEN);
        let test1_token, test2_token, test3_token;
        if ('token' in test1) test1_token = test1.token;
        if ('token' in test2) test2_token = test2.token;
        if ('token' in test3) test3_token = test3.token;

        expect(test1_token).not.toEqual(test2_token);
        expect(test2_token).not.toEqual(test3_token);
        expect(test3_token).not.toEqual(test1_token);
    });
});

// Various error cases
describe('Testing that registration returns error if and only if attempts are invalid', () => {
    test('Should return an error, if email is invalid', () => {
        const test1 = authRegisterReq('johndoe2genericemail.com', 'password123', 'John', 'Doe');
        expect(test1).toStrictEqual(ERROR);
    });

    test('Should return an error, if password is too short', () => {
        const test2 = authRegisterReq('johndoe@genericemail.com', 'pass123', 'John', 'Doe');
        expect('error' in test2).toStrictEqual(true);
        if ('error' in test2) {
            expect(test2.error).toBeDefined;
            expect(typeof test2.error).toEqual('string');
        }
    });

    test('Should return an error, if password has no numbers', () => {
        const test3 = authRegisterReq('johndoe@genericemail.com', 'password', 'John', 'Doe');
        expect('error' in test3).toStrictEqual(true);
        if ('error' in test3) {
            expect(test3.error).toBeDefined;
            expect(typeof test3.error).toEqual('string');
        }
    });

    test('Should return an error, if password has no letters', () => {
        const test4 = authRegisterReq('johndoe@genericemail.com', '12345678', 'John', 'Doe');
        expect('error' in test4).toStrictEqual(true);
        if ('error' in test4) {
            expect(test4.error).toBeDefined;
            expect(typeof test4.error).toEqual('string');
        }
    });

    test('Should return an error, if first name is too short', () => {
        const test5 = authRegisterReq('johndoe@genericemail.com', 'password123', 'J', 'Doe');
        expect('error' in test5).toStrictEqual(true);
        if ('error' in test5) {
            expect(test5.error).toBeDefined;
            expect(typeof test5.error).toEqual('string');
        }
    });

    test('Should return an error, if first name is too long', () => {
        const test6 = authRegisterReq('johndoe@genericemail.com', 'password123', 'Johnnnnnnnnnnnnnnnnnnnnnyyyyyyyyyy', 'Doe');
        expect('error' in test6).toStrictEqual(true);
        if ('error' in test6) {
            expect(test6.error).toBeDefined;
            expect(typeof test6.error).toEqual('string');
        }
    });

    test('Should return an error, if last name is too short', () => {
        const test7 = authRegisterReq('johndoe@genericemail.com', 'password123', 'John', 'D');
        expect('error' in test7).toStrictEqual(true);
        if ('error' in test7) {
            expect(test7.error).toBeDefined;
            expect(typeof test7.error).toEqual('string');
        }
    });

    test('Should return an error, if last name is too long', () => {
        const test8 = authRegisterReq('johndoe@genericemail.com', 'password123', 'John', 'DoeRayMiFaSoLaTiDoeeeee');
        expect('error' in test8).toStrictEqual(true);
        if ('error' in test8) {
            expect(test8.error).toBeDefined;
            expect(typeof test8.error).toEqual('string');
        }
    });

    test('Should return an error, if email already in use', () => {
        const control = authRegisterReq('johndoe@genericemail.com', 'password123', 'John', 'Doe');
        const test9 = authRegisterReq('johndoe@genericemail.com', 'password123', "the REAL john", 'Doe');
        expect('error' in test9).toStrictEqual(true);
        if ('error' in test9) {
            expect(test9.error).toBeDefined;
            expect(typeof test9.error).toEqual('string');
        }
    });

    test('Should return an error, if name has special characters', () => {
        const test10 = authRegisterReq('johndoe@genericemail.com', 'password123', 'J0hhn', '#Doe[[[');
        expect('error' in test10).toStrictEqual(true);
        if ('error' in test10) {
            expect(test10.error).toBeDefined;
            expect(typeof test10.error).toEqual('string');
        }
    });

    test('Should not return an error if name has apostrophes, spaces and hyphens', () => {
        const test11 = authRegisterReq('johndoe@genericemail.com', 'password123', "John Mc'Gee", 'Doe-seph');
        if('authUserId' in test11) {
            expect(typeof test11.authUserId).toStrictEqual(String);
        }
    });

    test('Should return an error, if only first name has special characters', () => {
        const test10 = authRegisterReq('johndoe@genericemail.com', 'password123', 'Johhn6', 'Doe');
        expect('error' in test10).toStrictEqual(true);
        if ('error' in test10) {
            expect(test10.error).toBeDefined;
            expect(typeof test10.error).toEqual('string');
        }
    });
    test('Should return an error, if only last name has special characters', () => {
        const test10 = authRegisterReq('johndoe@genericemail.com', 'password123', 'Johhn', 'Doe[');
        expect('error' in test10).toStrictEqual(true);
        if ('error' in test10) {
            expect(test10.error).toBeDefined;
            expect(typeof test10.error).toEqual('string');
        }
    });

});
