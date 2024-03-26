/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { clearRequest, userCreateRequest, userDetailsUpdateRequest } from '../requests';

const ERROR = { error: expect.any(String) };

/// ////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////// TESTS //////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

describe('Testing adminUserDetailsUpdate function:', () => {
  let user1Token : string;
  let user3Token : string;

  beforeEach(() => {
    clearRequest();
    user1Token = userCreateRequest('z000000@ad.unsw.edu.au', 'Password123', 'John', 'Doe').token;
    userCreateRequest('z000001@ad.unsw.edu.au', 'Password123', 'Sally', 'Seashells');
    user3Token = 'INVALIDTOKEN';
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
    expect(userDetailsUpdateRequest(user1Token, email, nameFirst, nameLast)).toStrictEqual(expectedReturn);
  });
  test('Testing Invalid UserId', () => {
    expect(userDetailsUpdateRequest(user3Token, 'z000000@ad.unsw.edu.au', 'John', 'Doe')).toStrictEqual(ERROR);
  });
});
