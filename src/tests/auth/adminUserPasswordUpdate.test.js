import { adminUserPasswordUpdate } from "../../auth";

const ERROR = { error: expect.any(String) };

describe('Testing adminUserPasswordUpdate function:', () => {
  let user1, user2;
  const password = 'Password123';
  beforeEach(() => {
    clear();
    user1 = adminAuthRegister('z000000@ad.unsw.edu.au', password,'John','Doe').authUserId;
    user2 = undefined;
    adminUserPasswordUpdate(user1, password, '')
  });
  test.each([
    ['Valid Password Change', password, 'Password321', {}],
    ['Old Password Incorrect', 'Password321', 'password1234', ERROR],
    ['New Password is Old Password', password, password, ERROR],
    ['New Password Length < 8', password, 'Pass1', ERROR],
    ['New Password No Numbers', password, 'Password', ERROR],
    ['New Password No Letters', password, '12345678', ERROR],
  ])('Testing %s:', (testName, oldPassword, newPassword, expectedReturn) => {
    expect(adminUserPasswordUpdate(user1, oldPassword, newPassword)).toStrictEqual(expectedReturn);
  });
  test('User Doesn\'t Exist', () => {
    expect(adminUserPasswordUpdate(user2, password, 'password321')).toStrictEqual(ERROR);
  })
  test('New Password is a Previous Password', () => {
    adminUserPasswordUpdate(user1, password, 'Password321');
    expect(adminUserPasswordUpdate(user1, 'Password321', password)).toStrictEqual(ERROR);
  })
});