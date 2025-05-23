import { url, port } from '../../config.json';
import request from 'sync-request-curl';
import { quizCreateRequestV2 } from '../requests';

const SERVER_URL = `${url}:${port}`;

// 'adminAuthRegister' function
const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { nameFirst, nameLast, email, password } });
  return JSON.parse(result.body.toString());
};

// 'quizCreateRequest' function
const quizCreateRequest = (token: string, name: string, description: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name, description } });
  return JSON.parse(result.body.toString());
};

let quiz1;
let quiz2;
let user1Token : string;
let user1;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
  user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe');
  if ('token' in user1) user1Token = user1.token;
  else user1Token = undefined;
});

describe('Testing QuizCreate function:', () => {
  // Success case
  test('successful output upon successful input', () => {
    quiz1 = quizCreateRequest(user1Token, 'Scrimbo', 'bloink');
    expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
    quiz2 = quizCreateRequest(user1Token, 'scrimbo TWO', 'buebr');
    expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });

    if ('quizId' in quiz1 && 'quizId' in quiz2) expect(quiz1.quizId).not.toEqual(quiz2.quizId);
  });

  // Error cases
  // token is not valid
  test('token is not a valid user', () => {
    const user1 = adminAuthRegister('email123@gmail.com', 'rtgfre356', 'Smith', 'Lee');
    quiz1 = quizCreateRequest(user1.token + 'thisisnotavalidtoken', 'name', 'description');
    expect(quiz1).toStrictEqual({ error: expect.any(String) });
  });

  // Invalid character in name
  test('Name contains an invalid character', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequest(userToken, '@@@@', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
  });

  test('Name contains an invalid character', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith1', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequest(userToken, 'Johnny@1', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
  });

  // Quiz name < 3 or > 30
  test('Name < 3 characters', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith1', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequest(userToken, 'qu', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Quiz name is < 3 characters' });
  });

  test('Name > 30 characters', () => {
    const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequest(userToken, 'quizname that would be more than 30 characters long', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Quiz name is > 30 characters' });
  });

  // Quiz description > 100
  test('Description > 100 characters', () => {
    const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequest(userToken, 'quizname', 'The inexorable march of technological advancement continues unabated, revolutionizing industries, reshaping economies, and fundamentally altering the way we live, work, and interact with the world around us.');
    expect(quiz1).toStrictEqual({ error: 'Quiz description is > 100 characters' });
  });

  // Quiz name already in use
  test('Quiz name is already in use', () => {
    const token1 = adminAuthRegister('123@email.com', '1234qwef', 'test', 'ting');
    expect('token' in token1).toStrictEqual(true);
    if ('token' in token1) {
      quiz1 = quizCreateRequest(token1.token, 'samename', 'simple description');
      quiz2 = quizCreateRequest(token1.token, 'samename', 'description');
      expect(quiz2).toStrictEqual({ error: 'Quiz name is already in use' });
    }
  });
});

describe('Testing QuizCreateV2 function:', () => {
  // Success case
  test('successful output upon successful input', () => {
    quiz1 = quizCreateRequestV2(user1Token, 'Scrimbo', 'bloink');
    expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
    quiz2 = quizCreateRequestV2(user1Token, 'scrimbo TWO', 'buebr');
    expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });

    if ('quizId' in quiz1 && 'quizId' in quiz2) expect(quiz1.quizId).not.toEqual(quiz2.quizId);
  });

  // Error cases
  // token is not valid
  test('token is not a valid user', () => {
    const user1 = adminAuthRegister('email123@gmail.com', 'rtgfre356', 'Smith', 'Lee');
    quiz1 = quizCreateRequestV2(user1.token + 'thisisnotavalidtoken', 'name', 'description');
    expect(quiz1).toStrictEqual({ error: expect.any(String) });
  });

  // Invalid character in name
  test('Name contains an invalid character', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequestV2(userToken, '@@@@', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
  });

  test('Name contains an invalid character', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith1', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequestV2(userToken, 'Johnny@1', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
  });

  // Quiz name < 3 or > 30
  test('Name < 3 characters', () => {
    const user = adminAuthRegister('testing@egmail.com', 'waltsmith1', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequestV2(userToken, 'qu', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Quiz name is < 3 characters' });
  });

  test('Name > 30 characters', () => {
    const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequestV2(userToken, 'quizname that would be more than 30 characters long', 'simple description');
    expect(quiz1).toStrictEqual({ error: 'Quiz name is > 30 characters' });
  });

  // Quiz description > 100
  test('Description > 100 characters', () => {
    const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
    let userToken : string;
    if ('token' in user) userToken = user.token;
    else userToken = undefined;
    quiz1 = quizCreateRequestV2(userToken, 'quizname', 'The inexorable march of technological advancement continues unabated, revolutionizing industries, reshaping economies, and fundamentally altering the way we live, work, and interact with the world around us.');
    expect(quiz1).toStrictEqual({ error: 'Quiz description is > 100 characters' });
  });

  // Quiz name already in use
  test('Quiz name is already in use', () => {
    const token1 = adminAuthRegister('123@email.com', '1234qwef', 'test', 'ting');
    expect('token' in token1).toStrictEqual(true);
    if ('token' in token1) {
      quiz1 = quizCreateRequestV2(token1.token, 'samename', 'simple description');
      quiz2 = quizCreateRequestV2(token1.token, 'samename', 'description');
      expect(quiz2).toStrictEqual({ error: 'Quiz name is already in use' });
    }
  });
});
