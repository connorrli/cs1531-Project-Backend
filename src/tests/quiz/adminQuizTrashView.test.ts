import { url, port } from '../../config.json';
import request from 'sync-request-curl';
import { quizCreateRequestV2, quizTrashRequestV2, quizTrashViewRequestV2 } from '../requests';

const SERVER_URL = `${url}:${port}`;
// const ERROR = { error: expect.any(String) };

interface AuthRegister { token: string }
interface QuizCreate { quizId: number }
type QuizRemove = Record<string, never>

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

// 'adminQuizRemove' function
const adminQuizRemove = (token: string, quizId: number) => {
  const result = request('DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token } });
  return JSON.parse(result.body.toString());
};

// 'adminQuizTrashView' function
const adminQuizTrashView = (token: string) => {
  const result = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token } });
  return JSON.parse(result.body.toString());
};

let user1: AuthRegister;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
  user1 = adminAuthRegister('johndoe@gmail.com', 'password123', 'Joghn', 'doo-doo');
});

// Success cases
describe('Correct output with proper requests', () => {
  let quiz1: QuizCreate;
  let quizrm: QuizRemove;
  beforeEach(() => {
    quiz1 = adminQuizCreate(user1.token, 'Quiz', 'meow');
    quizrm = adminQuizRemove(user1.token, quiz1.quizId);
  });
  test('Views one test from one user', () => {
    expect(quizrm).toStrictEqual({});
    expect(adminQuizTrashView(user1.token)).toStrictEqual({ quizzes: [{ quizId: quiz1.quizId, name: 'Quiz' }] });
  });
  test('Views the correct users quiz', () => {
    const user2: AuthRegister = adminAuthRegister('janedoe@gmail.com', 'password456', 'Jane', 'Doe');
    const quiz2: QuizCreate = adminQuizCreate(user2.token, 'Janes Quiz', '');
    const quiz2rm: QuizRemove = adminQuizRemove(user2.token, quiz2.quizId);

    expect(quiz2rm).toStrictEqual({});

    expect(adminQuizTrashView(user1.token)).toStrictEqual({ quizzes: [{ quizId: quiz1.quizId, name: 'Quiz' }] });
    expect(adminQuizTrashView(user2.token)).toStrictEqual({ quizzes: [{ quizId: quiz2.quizId, name: 'Janes Quiz' }] });
  });
  test('Shows zero quizzes for a user who has never deleted a quiz', () => {
    const user2: AuthRegister = adminAuthRegister('janedoe@gmail.com', 'password456', 'Jane', 'Doe');
    expect(adminQuizTrashView(user2.token)).toStrictEqual({ quizzes: [] });
  });
});

// Error case
describe('Gives an error when neccesary', () => {
  test('Invalid token', () => {
    expect(adminQuizTrashView(user1.token + '1')).toEqual({ error: expect.any(String) });
  });
});

describe('quizTrashViewV2 function tests', () => {
  let quizV2 : number;
  beforeEach(() => {
    quizV2 = quizCreateRequestV2(user1.token, 'Quiz', 'meow').quizId;
    quizTrashRequestV2(user1.token, quizV2);
  });
  test('Valid viewing', () => {
    expect(quizTrashViewRequestV2(user1.token)).toStrictEqual({ quizzes: [{ quizId: quizV2, name: 'Quiz' }] });
  });
  test('Invalid token', () => {
    expect(quizTrashViewRequestV2(user1.token + '1')).toEqual({ error: expect.any(String) });
  });
});
