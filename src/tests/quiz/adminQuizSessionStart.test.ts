import { QuestionBodyV2 } from '../../interface';
import {
  clearRequest,
  questionCreateRequestV2,
  questionDeleteRequestV2,
  quizCreateRequestV2,
  quizSessionStartRequest,
  quizTrashRequestV2,
  userCreateRequest
} from '../requests';

const SUCCESS_RESPONSE = { sessionId: expect.any(Number) };
const ERROR_RESPONSE = { error: expect.any(String) };

const VALID_AUTO_START = 5;
let userToken : string;
let quizId : number;
let questionId : number;
beforeEach(() => {
  clearRequest();
  userToken = userCreateRequest('test@gmail.com', 'Password1234', 'John', 'Doe').token;
  quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;

  const questionBody: QuestionBodyV2 = {
    question: 'Test question?',
    duration: 5,
    points: 5,
    answers: [
      {
        answer: 'Yes, test question',
        correct: true
      },
      {
        answer: 'No, not test question',
        correct: false
      },
    ],
    thumbnailUrl: 'https://example.com/images/bruh.png',
  };
  questionId = questionCreateRequestV2(userToken, quizId, questionBody).questionId;
});

describe('Testing adminQuizSessionStart route/function:', () => {
  test('Valid session start', () => {
    const response = quizSessionStartRequest(userToken, quizId, VALID_AUTO_START);
    expect(response).toStrictEqual(SUCCESS_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(true);
  });
  test('autoStartNum > 50', () => {
    const response = quizSessionStartRequest(userToken, quizId, 51);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('Current number of active sessions > 10', () => {
    for (let i = 0; i < 10; i++) {
      const response = quizSessionStartRequest(userToken, quizId, VALID_AUTO_START);
      expect(response).toStrictEqual(SUCCESS_RESPONSE);
    }

    const response = quizSessionStartRequest(userToken, quizId, VALID_AUTO_START);
    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('Quiz has no questions', () => {
    questionDeleteRequestV2(userToken, quizId, questionId);
    const response = quizSessionStartRequest(userToken, quizId, VALID_AUTO_START);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('Quiz is in trash', () => {
    quizTrashRequestV2(userToken, quizId);
    const response = quizSessionStartRequest(userToken, quizId, VALID_AUTO_START);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('Token is invalid', () => {
    const response = quizSessionStartRequest(userToken + 1, quizId, VALID_AUTO_START);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('User is not owner of quiz', () => {
    const userToken2 = userCreateRequest('anotheruser@gmail.com', 'Password12345', 'Sally', 'Seashells').token;
    const response = quizSessionStartRequest(userToken2, quizId, VALID_AUTO_START);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
  test('Quiz is in trash but user is not owner of quiz', () => {
    const userToken2 = userCreateRequest('anotheruser@gmail.com', 'Password12345', 'Sally', 'Seashells').token;
    quizTrashRequestV2(userToken, quizId);

    const response = quizSessionStartRequest(userToken2, quizId, VALID_AUTO_START);

    expect(response).toStrictEqual(ERROR_RESPONSE);

    // const sessions = quizSessionsViewRequest(userToken, quizId);
    // expect(sessions.activeSessions.includes(response.sessionId)).toStrictEqual(false);
  });
});
