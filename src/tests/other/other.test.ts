// Import statements, initiating the server and ensuring that the database is empty before each test
import request from 'sync-request-curl';
import { url, port } from '../../config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

// 'ClearRequest' function
const clearRequest = () => {
  const response = request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
  return JSON.parse(response.body.toString());
};

const deleteQuizzesRequest = (token: string, quizIds: Array<number>) => {
  const response = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', { qs: { token, quizIds: JSON.stringify(quizIds) } });
  return JSON.parse(response.body.toString());
};

const quizDelete = (quizId: number, token: string) => {
  const response = request('DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'userDetailsRequest' function
const userDetailsRequest = (token: string) => {
  const response = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizListRequest' function
const quizListRequest = (token: string) => {
  const response = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'userCreateRequest' function
const userCreateRequest = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
  return JSON.parse(response.body.toString());
};

// 'quizCreateRequest' function
const quizCreateRequest = (token: string, name: string, description: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name, description } });
  return JSON.parse(response.body.toString());
};

const trashView = (token: string) => {
  const response = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token } });
  return JSON.parse(response.body.toString());
};

let userToken: string;
const quizIds: Array<number> = [];

beforeEach(() => {
  const user = userCreateRequest('user@example.com', 'password123', 'John', 'Doe');
  userToken = user.token;

  for (let i = 0; i < 5; i++) {
    const quiz = quizCreateRequest(userToken, `Quiz ${i}`, `Description for Quiz ${i}`);
    quizDelete(quiz.quizId, userToken);
    quizIds.push(quiz.quizId);
  }
});

// 'clearTrash' function
describe('Delete quizzes out of trash', () => {
  test('Delete specific quizzes from trash', () => {
    const result = deleteQuizzesRequest(userToken, quizIds);
    expect(result).toStrictEqual({});
    const trash = trashView(userToken);
    expect(trash).toStrictEqual({ quizzes: [] });
  });

  test('Error handling for invalid quiz IDs', () => {
    const invalidQuiz = Math.max.apply(null, quizIds) + 1;
    const response = deleteQuizzesRequest(userToken, [invalidQuiz]);
    expect(response.error).toBeDefined();
  });
});

// General clearing of user data, test
test('Should clear user data', () => {
  const user1 = userCreateRequest('anotheruser@genericemail.com', 'password123', 'Another', 'User');
  clearRequest();
  const userData = userDetailsRequest(user1.token);
  expect(userData.error).toBeDefined();
});

// General clearing of quiz data, test
test('Should clear quiz data', () => {
  clearRequest();
  const user1 = userCreateRequest('anotheruser@genericemail.com', 'password123', 'Another', 'User');
  quizCreateRequest(user1.token, 'Biology', 'This is a short quiz about biology concepts.');

  const quizzesBeforeClear = quizListRequest(user1.token);
  expect(quizzesBeforeClear.error).toBeUndefined();

  clearRequest();

  const quizzesAfterClear = quizListRequest(user1.token);
  expect(quizzesAfterClear.error).toBeDefined();
});

// Formal test for the function to delete quiz data in the datastore
test('Should actually delete the quiz data in the datastore', () => {
  const ownerUser = userCreateRequest('owner@example.com', 'password123', 'Owner', 'User');
  quizCreateRequest(ownerUser.token, 'Math Quiz', 'This is a math quiz.');

  const quizzesBeforeClear = quizListRequest(ownerUser.token);
  expect(quizzesBeforeClear.error).toBeUndefined();

  clearRequest();
  const user2 = userCreateRequest('owner@example.com', 'password123', 'Owner', 'User');
  expect(user2).toStrictEqual({ token: expect.any(String) });
  const quizzesAfterClear = quizListRequest(user2.token);
  expect(quizzesAfterClear).toStrictEqual({ quizzes: [] });
});
