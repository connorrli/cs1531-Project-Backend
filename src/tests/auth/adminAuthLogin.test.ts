import request from 'sync-request-curl';
import { port, url } from '../../config.json';
const ERROR = { error: expect.any(String) };
const TOKEN = { token: expect.any(String) };

const SERVER_URL = `${url}:${port}`;

// 'authRegisterReq' function
const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { nameFirst, nameLast, email, password } });
  return JSON.parse(result.body.toString());
};

// 'authLoginReq' function
const authLoginReq = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email, password } });
  return JSON.parse(res.body.toString());
};
/* const userDetailsReq = (token: string) => {
    const res = request('GET', SERVER_URL + '/v1/admin/user/details?token=' + token);
    return JSON.parse(res.body.toString());
}; */

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

// Success cases
describe('Should successfuly log in under normal conditions.', () => {
  test('Should log in John Doe, the only user on the entire platform', () => {
    authRegisterReq('johndoe@gmail.com', 'password123', 'John', 'Doe');
    expect(authLoginReq('johndoe@gmail.com', 'password123')).toStrictEqual(TOKEN);
  });
  test('Should log in Jane Doe, the only user on the entire platform other than john', () => {
    authRegisterReq('johndoe@gmail.com', 'password123', 'John', 'Doe');
    authRegisterReq('janedoe@gmail.com', 'password123', 'Jane', 'Doe');
    expect(authLoginReq('johndoe@gmail.com', 'password123')).toStrictEqual(TOKEN);
    expect(authLoginReq('janedoe@gmail.com', 'password123')).toStrictEqual(TOKEN);
  });
});

// Error cases
describe('Should throw an error message under error conditions', () => {
  test('Should throw error, if email isnt registered', () => {
    expect(authLoginReq('johndoedoesntexist@gmail.com', 'password123')).toEqual(ERROR);
  });
  test('Should throw error, if email is registered but pass incorrect', () => {
    authRegisterReq('johndoe@gmail.com', 'password123', 'John', 'Doe');
    expect(authLoginReq('johndoe@gmail.com', 'Password123')).toEqual(ERROR);
  });
  test('Should throw error, if correct password correlates with a different correct email', () => {
    authRegisterReq('johndoe@gmail.com', 'password123', 'John', 'Doe');
    authRegisterReq('janedoe@gmail.com', 'diffpassw0rd', 'Jane', 'Doe');
    expect(authLoginReq('johndoe@gmail.com', 'diffpassw0rd')).toEqual(ERROR);
  });
});
