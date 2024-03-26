import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;

const adminAuthRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { nameFirst, nameLast, email, password } });
  return JSON.parse(result.body.toString());
};
const adminAuthLogOutReq = (token: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
  return JSON.parse(result.body.toString());
};

let user1Token : string;
let User2Token : string;
let user1;
let user2;

describe('Testing adminUserDetailsUpdate function:', () => {
  beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
    user1 = adminAuthRegisterReq('test@gmail.com', 'Password123', 'John', 'Doe');
    if ('token' in user1) user1Token = user1.token;
    else user1Token = undefined;
    user2 = adminAuthRegisterReq('water@gmail.com', 'waterisgood123', 'hydra', 'tion');
    if ('token' in user2) User2Token = user2.token;
    else User2Token = undefined;
  });

    // Check if the token is empty
    test('Token is empty', () => {
    const emptyToken = adminAuthLogOutReq('');
    expect(emptyToken.error).toStrictEqual(expect.any(String));
    });

    // Check if the token is empty
    test('Token is empty', () => {
        const emptyToken = adminAuthLogOutReq('');
        expect(emptyToken.error).toStrictEqual(expect.any(String));
    })

    // Check if there is such a user to log out
    test('No existing user to log out', () => {
        const noOne = adminAuthLogOutReq('8888');
        expect(noOne.error).toStrictEqual(expect.any(String));
    })

    // Check for correct output
    test('Correct Output', () => {
        const logout = adminAuthLogOutReq(user1Token);
        expect(logout).toStrictEqual({ });
    });

    // 2 users log out one after another
    test('2 users logging out one after another', () => {
        const logout1 = adminAuthLogOutReq(user1Token);
        expect(logout1).toStrictEqual({ });
        const logout2 = adminAuthLogOutReq(User2Token);
        expect(logout2).toStrictEqual({ });
    });
});
