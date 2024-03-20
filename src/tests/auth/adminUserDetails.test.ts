import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { setData, getData } from '../../dataStore';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

const TOKEN = { token: expect.any(String) };
const ERROR = { error: expect.any(String) };
const USER = { user: { 
        userId: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
    }
};

const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {email, password, nameFirst, nameLast}});
    return JSON.parse(res.body.toString());
}
const authLoginReq = (email: string, password: string) => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {json: {email, password}});
    return JSON.parse(res.body.toString());
}
const userDetailsReq = (token: string) => {
    const res = request('GET', SERVER_URL + '/v1/admin/user/details?token=' + token);
    return JSON.parse(res.body.toString());
}


describe('Should give correct user details', () => {
    test('Correct user details', () => {
        const user1 = authRegisterReq('yabbadabbadooidonotexist@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect(user1).toStrictEqual(TOKEN);
        if ('token' in user1) {
            const token: string = user1.token;
            expect(userDetailsReq(token)).toStrictEqual({ user: 
                {
                    userId: expect.any(Number), 
                    name: 'Yabba Dabba', 
                    email: 'yabbadabbadooidonotexist@gmail.com', 
                    numSuccessfulLogins: 1, 
                    numFailedPasswordsSinceLastLogin: 0
            }});

            const newToken = authLoginReq('yabbadabbadooidonotexist@gmail.com', 'yabba123dabbA').token as string;
            let userDetails = userDetailsReq(newToken);
            if ('user' in userDetails) {
                expect(userDetails.user.numSuccessfulLogins).toEqual(2);
                authLoginReq('yabbadabbadooidonotexist@gmail.com', 'password123');
            }
            // Re-fetch details with updated login data
            userDetails = userDetailsReq(newToken);
            if ('user' in userDetails) {
                expect(userDetails.user.numFailedPasswordsSinceLastLogin).toEqual(1);
            }
        } else {expect(2).toEqual(1);}
        const user2 = authRegisterReq('johnnymcjohn@gmail.com', 'John9090', 'John', 'Mc-John');
        expect(user2).toStrictEqual(TOKEN);
        if ('token' in user2) {
            expect(userDetailsReq(user2.token)).toStrictEqual({
                user: {
                    userId: expect.any(Number),
                    name: 'John Mc-John',
                    email: 'johnnymcjohn@gmail.com',
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0
                }
            });
        }
    });
    test.each( [
        { email: "hehehoho@gmail.com", password: "HEHEhohoh1234", nameFirst: "hehe", nameLast: "hoho" },
        { email: "waaahwahhhawh@gmail.com", password: "HuruhurEhohoh1234", nameFirst: "HHhhe", nameLast: "gghuu" },
        { email: "hotmailbestmail@gmail.com", password: "MIAMI89maim", nameFirst: "Gigamesh", nameLast: "Eater of Worlds" },
        { email: "icantdothisanymore@gmail.com", password: "iHateJest2024", nameFirst: "Grug", nameLast: "McGreg" }
    ])('Should give a user for various different registrations', ({ email, password, nameFirst, nameLast }) => {
        const user = authRegisterReq(email, password, nameFirst, nameLast);
        expect(user).toStrictEqual(TOKEN);
        if ('token' in user) expect(userDetailsReq(user.token)).toStrictEqual(USER);
    })
});

describe('Should throw error when needed', () => {
    test('throws an error when there is no user and therefore no session', () => {
        expect(userDetailsReq('1')).toStrictEqual(ERROR);
    });
    test('throws an error when userid is wrong but there is actually a guy registered', () => {
        const user1 = authRegisterReq('yabbadabbadoo@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect(user1).toStrictEqual(TOKEN);
        if ('token' in user1) expect(userDetailsReq(user1.token + '1')).toStrictEqual(ERROR);
    });
});