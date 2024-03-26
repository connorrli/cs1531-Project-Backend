import { url, port } from '../../config.json';
import request from 'sync-request-curl';

interface ErrorObject {
    error: string
}

const SERVER_URL = `${url}:${port}`;

let user1: { token: string } | ErrorObject;
let user1Token : string;
let list1: { quizId: number } | ErrorObject;

// 'adminAuthRegister' function
const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { nameFirst, nameLast, email, password } });
  return JSON.parse(result.body.toString());
};

// 'adminQuizCreate' function
const adminQuizCreate = (token: string, name: string, description: string) => {
  const result = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name, description } });
  return JSON.parse(result.body.toString());
};

// 'quizListReq' function
const quizListReq = (token: string) => {
  const result = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
  return JSON.parse(result.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
  user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe');
  if ('token' in user1) user1Token = user1.token;
  else user1Token = undefined;
});

describe('Testing quizList function:', () => {
  // token is not valtoken
  test('token is not a valtoken user', () => {
    list1 = adminQuizCreate(user1Token, 'name', 'description');
    const result = quizListReq(user1Token + '1');
    expect(result).toEqual({ error: expect.any(String) });
  });

  // Checking if function produces correct output
  test('Correctly print quiz list', () => {
    list1 = adminQuizCreate(user1Token, 'nameOfQuiz', 'description');
    const result = quizListReq(user1Token);
    expect('quizzes' in result).toEqual(true);
    if (!('error' in list1)) { expect(result).toEqual({ quizzes: [{ quizId: list1.quizId, name: 'nameOfQuiz' }] }); }
  });
});
