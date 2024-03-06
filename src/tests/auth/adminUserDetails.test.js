import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails
} from '../../auth.js';
import {
    clear
} from '../../other.js';

beforeEach(() => {
    clear();
});

const ERROR = { error: expect.any(String) };


describe('Should give correct user details', () => {
    test('Correct user details', () => {
        const user1 = adminAuthRegister('yabbadabbadoo@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({ user: 
            {
                userId: user1.authUserId, 
                name: 'Yabba Dabba', 
                email: 'yabbadabbadoo@gmail.com', 
                numSuccessfulLogins: 1, 
                numFailedPasswordsSinceLastLogin: 0
        }});
        adminAuthLogin('yabbadabbadoo@gmail.com', 'yabba123dabbA');
        expect(adminUserDetails(user1.authUserId).numSuccessfulLogins).toEqual(2);
        adminAuthLogin('yabbadabbadoo@gmail.com', 'password123');
        expect(adminUserDetails(user1.authUserId).numFailedPasswordsSinceLastLogin).toEqual(1);
        const user2 = adminAuthRegister('johnnymcjohn@gmail.com', 'John9090', 'John', 'Mc-John');
        expect(adminUserDetails(user2.authUserId)).toStrictEqual({
            user: {
                userId: user2.authUserId,
                name: 'John Mc-John',
                email: 'johnnymcjohn@gmail.com',
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0
            }
        });
    });
});

describe('Should throw error when needed', () => {
    test('throws an error when there is no such user id', () => {
        expect(adminUserDetails(1)).toStrictEqual(ERROR);
    });
    test('throws an error when userid is wrong but there is actually a guy registered', () => {
        const user1 = adminAuthRegister('yabbadabbadoo@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect(adminUserDetails(user1.authUserId + 1)).toStrictEqual(ERROR);
    });
});