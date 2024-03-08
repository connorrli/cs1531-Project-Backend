///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { adminUserDetailsUpdate, adminAuthRegister } from '../../auth.js';
import { clear } from '../../other.js';

const ERROR = { error: expect.any(String) };

///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// TESTS //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

describe('Testing adminUserDetailsUpdate function:', () => {
    let user1;
    let user2;
    let user3;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('z000000@ad.unsw.edu.au','Password123','John','Doe').authUserId;
        user2 = adminAuthRegister('z000001@ad.unsw.edu.au','Password321','Sally','Seashells').authUserId;
        user3 = 3;
    });

    test.each([
        ['Valid Email Change', 'z000002@ad.unsw.edu.au', 'John', 'Doe', {}],
        ['Valid First Name Change', 'z000000@ad.unsw.edu.au', 'Sue', 'Doe', {}],
        ['Valid Last Name Change', 'z000000@ad.unsw.edu.au', 'John', 'Big-Jones', {}],
        ['Existing Email (Other\'s Email)', 'z000001@ad.unsw.edu.au', 'John', 'Doe', ERROR],
        ['Existing Email (Own Email)', 'z000000@ad.unsw.edu.au', 'John', 'Doe', {}],
        ['Invalid Email', 'john.com', 'John', 'Doe', ERROR],
        ['First Name Invalid (invalid chars)', 'z000000@ad.unsw.edu.au', '][', 'Doe', ERROR],
        ['First Name Invalid (too short, < 2)', 'z000000@ad.unsw.edu.au', 'a', 'Doe', ERROR],
        ['First Name Invalid (too long, > 20)', 'z000000@ad.unsw.edu.au', 'aaaaaaaaaaaaaaaaaaaaa', 'Doe', ERROR],
        ['Last Name Invalid (invalid chars)', 'z000000@ad.unsw.edu.au', 'John', '][', ERROR],
        ['Last Name Invalid (too short, < 2)', 'z000000@ad.unsw.edu.au', 'John', 'a', ERROR],
        ['Last Name Invalid (too long, > 20)', 'z000000@ad.unsw.edu.au', 'John', 'aaaaaaaaaaaaaaaaaaaaa', ERROR],
    ])('Testing %s', (testTitle, email, nameFirst, nameLast, expectedReturn) => {
        expect(adminUserDetailsUpdate(user1, email, nameFirst, nameLast)).toStrictEqual(expectedReturn);
    });
    test('Testing Invalid UserId', () => {
        expect(adminUserDetailsUpdate(user3, 'z000002@ad.unsw.edu.au', 'John', 'Doe')).toStrictEqual(ERROR);
    })
});
