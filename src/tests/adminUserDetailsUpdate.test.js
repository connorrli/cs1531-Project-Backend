///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import { adminUserDetailsUpdate, adminAuthRegister, adminAuthLogin } from '../auth.js';
import { error } from '../helpers/errors.js';
import { getData, setData } from '../dataStore.js';
import { clear } from '../other.js';

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

    const ERROR = { error: expect.any(String)};

    // Assume that we have logged in.
    test('Valid changes:', () => {
        const data = getData();
        expect(adminUserDetailsUpdate(user1, 'z000002@ad.unsw.edu.au', 'Tim', 'Burton')).toEqual({ });
        const new_data = getData();
        const user = data['users'].find(user => user.userId === user1);
        expect(user['email']).toEqual('z000002@ad.unsw.edu.au');
        expect(user['nameFirst']).toEqual('Tim');
        expect(user['nameLast']).toEqual('Burton');
    });

    test('Invalid authUserId:', () => {
        expect(adminUserDetailsUpdate(user3, 'z000002.com', 'John', 'Doe'))
        .toEqual(ERROR);
    });

    test('Duplicate email:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000001@ad.unsw.edu.au', 'John', 'Doe'))
        .toEqual(ERROR);
    });

    test('Invalid email:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000001.com', 'John', 'Doe'))
        .toEqual(ERROR);
    });

    test('First name invalid:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', '][', 'Doe'))
        .toEqual(ERROR);
    });

    test('Last name invalid:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', ']['))
        .toEqual(ERROR);
    });
    
    test('First name too long:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'aaaaaaaaaaaaaaaaaaaaa', 'Doe'))
        .toEqual(ERROR);
    });

    test('Last name too long:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', 'aaaaaaaaaaaaaaaaaaaaa'))
        .toEqual(ERROR);
    });

    test('First name too short:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'a', 'Doe'))
        .toEqual(ERROR);
    });

    test('Last name too short:', () => {
        expect(adminUserDetailsUpdate(user1, 'z000000@ad.unsw.edu.au', 'John', 'a'))
        .toEqual(ERROR);
    });
});
