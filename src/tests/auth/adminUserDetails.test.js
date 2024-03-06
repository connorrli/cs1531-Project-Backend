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
        expect(adminUserDetails(user1.authUserId)).toStrictEqual({ user: 
            {
                userId: user1.authUserId, 
                name: 'Yabba Dabba', 
                email: 'yabbadabbadoo@gmail.com', 
                numSuccessfulLogins: 1, 
                numFailedPasswordsSinceLastLogin: 0
        }});
        adminAuthLogin('yabbadabbadoo@gmail.com', 'yabba123dabbA');
        expect(adminUserDetails(user1.authUserId).user.numSuccessfulLogins).toEqual(2);
        adminAuthLogin('yabbadabbadoo@gmail.com', 'password123');
        expect(adminUserDetails(user1.authUserId).user.numFailedPasswordsSinceLastLogin).toEqual(1);
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
    test.each( [
        { email: "hehehoho@gmail.com", password: "HEHEhohoh1234", nameFirst: "hehe", nameLast: "hoho" },
        { email: "waaahwahhhawh@gmail.com", password: "HuruhurEhohoh1234", nameFirst: "HHhhe", nameLast: "gghuu" },
        { email: "hotmailbestmail@gmail.com", password: "MIAMI89maim", nameFirst: "Gigamesh", nameLast: "Eater of Worlds" },
        { email: "icantdothisanymore@gmail.com", password: "iHateJest2024", nameFirst: "Grug", nameLast: "McGreg" }
    ])('Should give a user for various different registrations', ({ email, password, nameFirst, nameLast }) => {
        const user = adminAuthRegister(email, password, nameFirst, nameLast);
        expect(adminUserDetails(user.authUserId)).toStrictEqual(USER);
    })
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