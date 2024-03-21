///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// IMPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { ErrorObject } from '../../interface';

interface Token { token: string };

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
    return JSON.parse(res.body.toString());
}
const userDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email, nameFirst, nameLast} });
    return JSON.parse(res.body.toString());
}
///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// TESTS //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

describe('Testing adminUserDetailsUpdate function:', () => {
    let user1: Token | ErrorObject;
    let user2: Token | ErrorObject;
    let user1_tok: string;
    const user3_tok = "";
    beforeEach(() => {
        request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
        user1 = authRegisterReq('z000000@ad.unsw.edu.au','Password123','John','Doe');
        user2 = authRegisterReq('z000001@ad.unsw.edu.au','Password123','Sally','Seashells');
        
        if ('token' in user1) user1_tok = user1.token;

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
        expect(userDetailsUpdate(user1_tok, email, nameFirst, nameLast)).toStrictEqual(expectedReturn);
    });
    test('Testing Invalid Token', () => {
        expect(userDetailsUpdate(user3_tok, 'z000002@ad.unsw.edu.au', 'John', 'Doe')).toStrictEqual(ERROR);
    })
});
