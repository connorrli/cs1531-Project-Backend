
import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { quizCreateRequestV2, quizDescriptionUpdateRequestV2, quizInfoRequestV2 } from '../requests';
const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

// 'quizDescUpdReq' function
const quizDescUpdReq = (token: string, quizId: number, description: string) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/quiz/' + quizId.toString() + '/description', { json: { token, description } });
  return JSON.parse(res.body.toString());
};

// 'authRegisterReq' function
const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
  return JSON.parse(res.body.toString());
};

// 'quizCreateReq' function
const quizCreateReq = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token, name: name, description: description } });
  return JSON.parse(res.body.toString());
};

// 'quizInfoReq' function
const quizInfoReq = (token: string, quizId: number) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token: token } });
  return JSON.parse(res.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

describe('quizDescriptionUpdate function tests', () => {
  test('Should return an error when quizId does not refer to a valid quiz', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password123', 'John', 'Doe');
    const quizId = quizCreateReq(authUserTok.token, 'Test Quiz', 'This is a test quiz');
    quizDescUpdReq(authUserTok.token, quizId.quizId, 'Updated Test Quiz Description');

    const result = quizDescUpdReq(authUserTok.token, quizId.quizId + 1, '');
    expect(result.error).toEqual(expect.any(String));
  });

  test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
    const userId1 = authRegisterReq('test1@example.com', 'password643', 'John', 'Doe');
    const userId2 = authRegisterReq('test2@example.com', 'password292', 'Jane', 'Smith');
    const quizId = quizCreateReq(userId1.token, 'Test Quiz', 'This is a test quiz');

    quizDescUpdReq(userId1.token, quizId.quizId, 'Updated Test Quiz Description');

    const result = quizDescUpdReq(userId2.token, quizId.quizId, '');
    expect(result.error).toEqual(expect.any(String));
  });

  test('Should return an error when the description is more than 100 characters in length', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password433', 'John', 'Doe');
    const quizId = quizCreateReq(authUserTok.token, 'Test Quiz', 'This is a test quiz');

    const newDescription = 'This is a description longer than 100 characters. ' + '...'.repeat(50);
    const result = quizDescUpdReq(authUserTok.token, quizId.quizId, newDescription);

    expect(result.error).toEqual(expect.any(String));
  });

  // This is the only success case here. All the others are error cases.
  test('Should update the quiz description successfully', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password123', 'John', 'Doe');
    const quizId = quizCreateReq(authUserTok.token, 'Test Quiz', 'This is a test quiz');

    const newDescription = 'This is an updated test quiz description';
    quizDescUpdReq(authUserTok.token, quizId.quizId, newDescription);

    const quizInfo = quizInfoReq(authUserTok.token, quizId.quizId);

    expect(quizInfo.error).toBeUndefined();
    expect(quizInfo.description).toBe(newDescription);
  });

  test('Should return an error when authUserId is invalid', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password976', 'Peter', 'Kim');
    const quizId = quizCreateReq(authUserTok.token, 'Test Quiz', 'This is a test quiz');
    const result = quizDescUpdReq(authUserTok.token + '1', quizId.quizId, '');
    expect(result).toEqual(ERROR);
  });
});

describe('quizDescriptionUpdateV2 function tests', () => {
  test('Should return an error when quizId does not refer to a valid quiz', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password123', 'John', 'Doe');
    const quizId = quizCreateRequestV2(authUserTok.token, 'Test Quiz', 'This is a test quiz');
    quizDescriptionUpdateRequestV2(authUserTok.token, quizId.quizId, 'Updated Test Quiz Description');

    const result = quizDescriptionUpdateRequestV2(authUserTok.token, quizId.quizId + 1, '');
    expect(result.error).toEqual(expect.any(String));
  });

  test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
    const userId1 = authRegisterReq('test1@example.com', 'password643', 'John', 'Doe');
    const userId2 = authRegisterReq('test2@example.com', 'password292', 'Jane', 'Smith');
    const quizId = quizCreateRequestV2(userId1.token, 'Test Quiz', 'This is a test quiz');

    quizDescriptionUpdateRequestV2(userId1.token, quizId.quizId, 'Updated Test Quiz Description');

    const result = quizDescriptionUpdateRequestV2(userId2.token, quizId.quizId, '');
    expect(result.error).toEqual(expect.any(String));
  });

  test('Should return an error when the description is more than 100 characters in length', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password433', 'John', 'Doe');
    const quizId = quizCreateRequestV2(authUserTok.token, 'Test Quiz', 'This is a test quiz');

    const newDescription = 'This is a description longer than 100 characters. ' + '...'.repeat(50);
    const result = quizDescriptionUpdateRequestV2(authUserTok.token, quizId.quizId, newDescription);

    expect(result.error).toEqual(expect.any(String));
  });

  // This is the only success case here. All the others are error cases.
  test('Should update the quiz description successfully', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password123', 'John', 'Doe');
    const quizId = quizCreateRequestV2(authUserTok.token, 'Test Quiz', 'This is a test quiz');

    const newDescription = 'This is an updated test quiz description';
    quizDescriptionUpdateRequestV2(authUserTok.token, quizId.quizId, newDescription);

    const quizInfo = quizInfoRequestV2(authUserTok.token, quizId.quizId);

    expect(quizInfo.error).toBeUndefined();
    expect(quizInfo.description).toBe(newDescription);
  });

  test('Should return an error when authUserId is invalid', () => {
    const authUserTok = authRegisterReq('test@example.com', 'password976', 'Peter', 'Kim');
    const quizId = quizCreateRequestV2(authUserTok.token, 'Test Quiz', 'This is a test quiz');
    const result = quizDescriptionUpdateRequestV2(authUserTok.token + '1', quizId.quizId, '');
    expect(result).toEqual(ERROR);
  });
});
