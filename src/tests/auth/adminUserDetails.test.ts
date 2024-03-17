import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails
} from '../../auth';
import {
    clear
} from '../../other';

beforeEach(() => {
    clear();
});

const ERROR = { error: expect.any(String) };
const USER = { user: { 
        userId: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
    }
};

describe('Should give correct user details', () => {
    test('Correct user details', () => {
        const user1 = adminAuthRegister('yabbadabbadoo@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect('authUserId' in user1).toStrictEqual(true);
        if ('authUserId' in user1) {
            expect(adminUserDetails(user1.authUserId)).toStrictEqual({ user: 
                {
                    userId: user1.authUserId, 
                    name: 'Yabba Dabba', 
                    email: 'yabbadabbadoo@gmail.com', 
                    numSuccessfulLogins: 1, 
                    numFailedPasswordsSinceLastLogin: 0
            }});

            adminAuthLogin('yabbadabbadoo@gmail.com', 'yabba123dabbA');
            let userDetails = adminUserDetails(user1.authUserId);
            if ('user' in userDetails) {
                expect(userDetails.user.numSuccessfulLogins).toEqual(2);
                adminAuthLogin('yabbadabbadoo@gmail.com', 'password123');
            }
            // Re-fetch details with updated login data
            userDetails = adminUserDetails(user1.authUserId);
            if ('user' in userDetails) {
                expect(userDetails.user.numFailedPasswordsSinceLastLogin).toEqual(1);
            }
        }
        const user2 = adminAuthRegister('johnnymcjohn@gmail.com', 'John9090', 'John', 'Mc-John');
        expect('authUserId' in user2).toStrictEqual(true);
        if ('authUserId' in user2) {
            expect(adminUserDetails(user2.authUserId)).toStrictEqual({
                user: {
                    userId: user2.authUserId,
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
        const user = adminAuthRegister(email, password, nameFirst, nameLast);
        expect('authUserId' in user).toStrictEqual(true)
        if ('authUserId' in user) expect(adminUserDetails(user.authUserId)).toStrictEqual(USER);
    })
});

describe('Should throw error when needed', () => {
    test('throws an error when there is no such user id', () => {
        expect(adminUserDetails(1)).toStrictEqual(ERROR);
    });
    test('throws an error when userid is wrong but there is actually a guy registered', () => {
        const user1 = adminAuthRegister('yabbadabbadoo@gmail.com', 'yabba123dabbA', 'Yabba', 'Dabba');
        expect('authUserId' in user1).toStrictEqual(true);
        if ('authUserId' in user1) expect(adminUserDetails(user1.authUserId + 1)).toStrictEqual(ERROR);
    });
});