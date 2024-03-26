import {
  clearRequest,
  // loginRequest,
  passwordUpdateRequest,
  // userDetailsRequest,
  userCreateRequest
} from '../requests';

const ERROR = { error: expect.any(String) };

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
    const response1 = passwordUpdateRequest(userToken1, oldPassword, newPassword);
    expect(response1).toStrictEqual(expectedReturn1);

    // Commented out certain expect statements until routes have been fully implemented
    // loginRequest(INIT_VALID_EMAIL, newPassword);
    // const response2 = userDetailsRequest(userToken1);
    // expect(response2.user.numSuccessfulLogins).toStrictEqual(expectedReturn2);
  });
  test('User Doesn\'t Exist', () => {
    const newPassword = 'password321';
    const response = passwordUpdateRequest(userToken2, INIT_VALID_PASSWORD, newPassword);
    expect(response).toStrictEqual(ERROR);
  });
  test('New Password is a Previous Password', () => {
    const newPassword = 'Password12345';
    passwordUpdateRequest(userToken1, INIT_VALID_PASSWORD, newPassword);

    const response1 = passwordUpdateRequest(userToken1, newPassword, INIT_VALID_PASSWORD);
    expect(response1).toStrictEqual(ERROR);

    // loginRequest(INIT_VALID_EMAIL, INIT_VALID_PASSWORD);
    // const response2 = userDetailsRequest(userToken1);

    // expect(response2.user.numSuccessfulLogins).toStrictEqual(1);
  });
});
