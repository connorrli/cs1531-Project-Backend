import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

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

// 'adminQuizInfo' function
const adminQuizInfo = (token: string, quizId: number) => {
  const result = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token } });
  return JSON.parse(result.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

describe('adminQuizInfo function tests', () => {
  // A success case and multiple error cases
  test('Returns quiz information for a valid quiz owned by the user', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const quizInfo = adminQuizInfo(authUser.token, quiz.quizId);
        expect(quizInfo).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Test Quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'This is a test quiz'
        });
      }
    }
  });

  test('Returns an error when token is not a valid user', () => {
    const quizInfo = adminQuizInfo('42', 42);
    expect(quizInfo).toEqual(ERROR);
  });

  test('Returns an error when quizId is not a valid quiz', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quizInfo = adminQuizInfo(authUser.token, 42);
      expect(quizInfo).toEqual(ERROR);
    }
  });

  test('Returns an error when quizId is not owned by token', () => {
    const authUser1 = adminAuthRegister('user1@example.com', 'password231', 'First', 'User');
    const authUser2 = adminAuthRegister('user2@example.com', 'password123', 'Second', 'User');
    if ('token' in authUser1 && 'token' in authUser2) {
      const quiz = adminQuizCreate(authUser1.token, 'User 1 Quiz', 'This is a quiz created by user 1');
      if ('quizId' in quiz) {
        const quizInfo = adminQuizInfo(authUser2.token, quiz.quizId);
        expect(quizInfo).toEqual(ERROR);
      }
    }
  });
});
