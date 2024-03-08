import { 
  adminUserPasswordUpdate, 
  adminAuthRegister, 
  adminAuthLogin,
  adminUserDetails, 
} from "../../auth.js";
import { clear } from '../../other.js';

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
    ['Valid Password Change', password, 'Password321', {}, 2],
    ['Old Password Incorrect', 'Password321', 'password1234', ERROR, 1],
    ['New Password is Old Password', password, password, ERROR, 2],
    ['New Password Length < 8', password, 'Pass1', ERROR, 1],
    ['New Password No Numbers', password, 'Password', ERROR, 1],
    ['New Password No Letters', password, '12345678', ERROR, 1],
  ])('Testing %s:', (testName, oldPassword, newPassword, expectedReturn1, expectedReturn2) => {
    expect(adminUserPasswordUpdate(user1, oldPassword, newPassword)).toStrictEqual(expectedReturn1);
    // Check that new password either worked or didn't work depending on if it changed or not
    adminAuthLogin('z000000@ad.unsw.edu.au', newPassword);
    expect(adminUserDetails(user1).user.numSuccessfulLogins).toStrictEqual(expectedReturn2);
  });
  test('User Doesn\'t Exist', () => {
    const newPassword = 'password321';
    expect(adminUserPasswordUpdate(user2, password, newPassword)).toStrictEqual(ERROR);
  });
  test('New Password is a Previous Password', () => {
    const newPassword = 'password321';
    adminUserPasswordUpdate(user1, password, newPassword);
    expect(adminUserPasswordUpdate(user1, 'Password321', password)).toStrictEqual(ERROR);
    adminAuthLogin('z000000@ad.unsw.edu.au', password);
    expect(adminUserDetails(user1).user.numSuccessfulLogins).toStrictEqual(1);
  });
});