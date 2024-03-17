import { 
  adminUserPasswordUpdate, 
  adminAuthRegister, 
  adminAuthLogin,
  adminUserDetails, 
} from "../../auth";
import { clear } from '../../other';

const ERROR = { error: expect.any(String) };

describe('Testing adminUserPasswordUpdate function:', () => {
  let user1;
  let user1_id : number;
  let user2_id : number;
  const password = 'Password123';
  beforeEach(() => {
    clear();
    user1 = adminAuthRegister('z000000@ad.unsw.edu.au', password,'John','Doe');
    if ('authUserId' in user1) user1_id = user1.authUserId;
    user2_id = -1;
  });
  test.each([
    ['Valid Password Change', password, 'Password321', {}, 2],
    ['Old Password Incorrect', 'Password321', 'password1234', ERROR, 1],
    ['New Password is Old Password', password, password, ERROR, 2],
    ['New Password Length < 8', password, 'Pass1', ERROR, 1],
    ['New Password No Numbers', password, 'Password', ERROR, 1],
    ['New Password No Letters', password, '12345678', ERROR, 1],
  ])('Testing %s:', (testName, oldPassword, newPassword, expectedReturn1, expectedReturn2) => {
    expect(adminUserPasswordUpdate(user1_id, oldPassword, newPassword)).toStrictEqual(expectedReturn1);
    // Check that new password either worked or didn't work depending on if it changed or not
    adminAuthLogin('z000000@ad.unsw.edu.au', newPassword);
    const userDetails = adminUserDetails(user1_id);
    if ('user' in userDetails) expect(userDetails.user.numSuccessfulLogins).toStrictEqual(expectedReturn2);
  });
  test('User Doesn\'t Exist', () => {
    const newPassword = 'password321';
    expect(adminUserPasswordUpdate(user2_id, password, newPassword)).toStrictEqual(ERROR);
  });
  test('New Password is a Previous Password', () => {
    const newPassword = 'password321';
    adminUserPasswordUpdate(user1_id, password, newPassword);
    expect(adminUserPasswordUpdate(user1_id, 'Password321', password)).toStrictEqual(ERROR);
    adminAuthLogin('z000000@ad.unsw.edu.au', password);
    const userDetails = adminUserDetails(user1_id);
    if ('user' in userDetails) expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1);
  });
});