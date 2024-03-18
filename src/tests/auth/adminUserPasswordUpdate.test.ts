import request from 'sync-request-curl';
import { url, port } from '../../config.json';

const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

const clearRequest = () => {
  const response = request('DELETE', SERVER_URL + 'v1/clear', { qs: { } });
  return JSON.parse(response.body.toString());
}

const loginRequest = (email: string, password: string) => {
  const response = request('POST', SERVER_URL + 'v1/admin/auth/login', { json: { email, password } });
  return JSON.parse(response.body.toString());
}

const responseGet = (token: string, oldPassword: string, newPassword: string) => {
  const response = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword, newPassword } });
  return JSON.parse(response.body.toString());
}

const userDetailsRequest = (token: string) => {
  const response = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token } });
  return JSON.parse(response.body.toString());
}

const userCreateRequest = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
  return JSON.parse(response.body.toString());
}

describe('Testing adminUserPasswordUpdate function:', () => {
  const INIT_VALID_EMAIL = 'z000000@ad.unsw.edu.au';
  const INIT_VALID_PASSWORD = 'Password123';
  let userToken1 : string;
  let userToken2 : string;
  beforeEach(() => {
    clearRequest();
    userToken1 = userCreateRequest(INIT_VALID_EMAIL, INIT_VALID_PASSWORD, 'John', 'Doe').token;
    userToken2 = '';
  });
  test.each([
    ['Valid Password Change', INIT_VALID_PASSWORD, 'Password321', {}, 2],
    ['Old Password Incorrect', 'Password321', 'password1234', ERROR, 1],
    ['New Password is Old Password', INIT_VALID_PASSWORD, INIT_VALID_PASSWORD, ERROR, 2],
    ['New Password Length < 8', INIT_VALID_PASSWORD, 'Pass1', ERROR, 1],
    ['New Password No Numbers', INIT_VALID_PASSWORD, 'Password', ERROR, 1],
    ['New Password No Letters', INIT_VALID_PASSWORD, '12345678', ERROR, 1],
  ])('Testing %s:', (testName, oldPassword, newPassword, expectedReturn1, expectedReturn2) => {
    const response1 = responseGet(userToken1, oldPassword, newPassword);

    expect(response1).toStrictEqual(expectedReturn1);

    loginRequest(INIT_VALID_EMAIL, newPassword);
    const response2 = userDetailsRequest(userToken1);
    expect(response2.user.numSuccessfulLogins).toStrictEqual(expectedReturn2);
  });
  test('User Doesn\'t Exist', () => {
    const newPassword = 'password321';
    const response = responseGet(userToken2, INIT_VALID_PASSWORD, newPassword);
    expect(response).toStrictEqual(ERROR);
  });
  test('New Password is a Previous Password', () => {
    const newPassword = 'Password12345';
    responseGet(userToken1, INIT_VALID_PASSWORD, newPassword);

    const response1 = responseGet(userToken1, newPassword, INIT_VALID_PASSWORD);
    expect(response1).toStrictEqual(ERROR);

    loginRequest(INIT_VALID_EMAIL, INIT_VALID_PASSWORD);
    const response2 = userDetailsRequest(userToken1);

    expect(response2.user.numSuccessfulLogins).toStrictEqual(1);
  });
});