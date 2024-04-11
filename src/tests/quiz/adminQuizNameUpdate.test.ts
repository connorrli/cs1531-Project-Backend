import { url, port } from '../../config.json';
import request from 'sync-request-curl';
import { quizCreateRequestV2, quizInfoRequestV2, quizNameUpdateRequestV2 } from '../requests';

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

// 'adminQuizNameUpdate' function
const adminQuizNameUpdate = (token: string, quizId: number, name: string) => {
  const result = request('PUT', SERVER_URL + '/v1/admin/quiz/' + quizId.toString() + '/name', { json: { token, name } });
  return JSON.parse(result.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

describe('adminQuizNameUpdate function tests', () => {
  // An error case and multiple success cases
  test('Should correctly update the quiz name', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const updatedQuizName = 'Updated Quiz Name';
        const result = adminQuizNameUpdate(authUser.token, quiz.quizId, updatedQuizName);
        expect(result).toStrictEqual({});
        const quizInfo = adminQuizInfo(authUser.token, quiz.quizId);
        if ('name' in quizInfo) {
          expect(quizInfo.name).toStrictEqual(updatedQuizName);
        }
      }
    }
  });

  test('Should return an error when token is invalid', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser.token + '1', quiz.quizId, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return an error when quizId does not refer to a valid quiz', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser.token, quiz.quizId + 1, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
    const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
    const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');

    if ('token' in authUser1 && 'token' in authUser2) {
      const quiz = adminQuizCreate(authUser1.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser2.token, quiz.quizId, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
    const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
    const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
    if ('token' in authUser1 && 'token' in authUser2) {
      const quiz = adminQuizCreate(authUser1.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser1.token, quiz.quizId, 'name');
        expect(result).not.toHaveProperty('error');
        const quizInfo = adminQuizInfo(authUser1.token, quiz.quizId);
        if ('name' in quizInfo) {
          expect(quizInfo.name).toStrictEqual('name');
        }
      }
    }
  });

  test('Should return error when name has invalid characters', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser.token, quiz.quizId, 'Updated Name $');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is less than 3 characters long', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const result = adminQuizNameUpdate(authUser.token, quiz.quizId, 'A');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is more than 30 characters long', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = adminQuizCreate(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const thirtyOneCharName = 'abcdefghijklmnopqrstuvwxyzABCDE';
        const result = adminQuizNameUpdate(authUser.token, quiz.quizId, thirtyOneCharName);
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is already used by the current logged in user for another quiz', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      adminQuizCreate(authUser.token, 'Quiz 1', 'Description1');
      const quiz2 = adminQuizCreate(authUser.token, 'Quiz 2', 'Description2');
      if ('quizId' in quiz2) {
        const result = adminQuizNameUpdate(authUser.token, quiz2.quizId, 'Quiz 1');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });
});

describe('adminQuizNameUpdateV2 function tests', () => {
  // An error case and multiple success cases
  test('Should correctly update the quiz name', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const updatedQuizName = 'Updated Quiz Name';
        const result = quizNameUpdateRequestV2(authUser.token, quiz.quizId, updatedQuizName);
        expect(result).toStrictEqual({});
        const quizInfo = quizInfoRequestV2(authUser.token, quiz.quizId);
        if ('name' in quizInfo) {
          expect(quizInfo.name).toStrictEqual(updatedQuizName);
        }
      }
    }
  });

  test('Should return an error when token is invalid', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser.token + '1', quiz.quizId, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return an error when quizId does not refer to a valid quiz', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser.token, quiz.quizId + 1, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
    const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
    const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');

    if ('token' in authUser1 && 'token' in authUser2) {
      const quiz = quizCreateRequestV2(authUser1.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser2.token, quiz.quizId, 'name');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
    const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
    const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
    if ('token' in authUser1 && 'token' in authUser2) {
      const quiz = quizCreateRequestV2(authUser1.token, 'Test Quiz', 'This is a test quiz');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser1.token, quiz.quizId, 'name');
        expect(result).not.toHaveProperty('error');
        const quizInfo = quizInfoRequestV2(authUser1.token, quiz.quizId);
        if ('name' in quizInfo) {
          expect(quizInfo.name).toStrictEqual('name');
        }
      }
    }
  });

  test('Should return error when name has invalid characters', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser.token, quiz.quizId, 'Updated Name $');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is less than 3 characters long', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const result = quizNameUpdateRequestV2(authUser.token, quiz.quizId, 'A');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is more than 30 characters long', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      const quiz = quizCreateRequestV2(authUser.token, 'Quiz 1', 'Description');
      if ('quizId' in quiz) {
        const thirtyOneCharName = 'abcdefghijklmnopqrstuvwxyzABCDE';
        const result = quizNameUpdateRequestV2(authUser.token, quiz.quizId, thirtyOneCharName);
        expect(result).toStrictEqual(ERROR);
      }
    }
  });

  test('Should return error when name is already used by the current logged in user for another quiz', () => {
    const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    if ('token' in authUser) {
      quizCreateRequestV2(authUser.token, 'Quiz 1', 'Description1');
      const quiz2 = quizCreateRequestV2(authUser.token, 'Quiz 2', 'Description2');
      if ('quizId' in quiz2) {
        const result = quizNameUpdateRequestV2(authUser.token, quiz2.quizId, 'Quiz 1');
        expect(result).toStrictEqual(ERROR);
      }
    }
  });
});
