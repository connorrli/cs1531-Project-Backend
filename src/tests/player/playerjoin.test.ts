import {
  quizSessionStartRequest,
  userCreateRequest,
  playerJoinRequest,
  quizCreateRequestV2,
  questionCreateRequestV2,
  clearRequest
} from '../requests';

const ERROR = { error: expect.any(String) };

let quizSession: { sessionId: number };

beforeEach(() => {
  clearRequest();
  const user = userCreateRequest('john@gmail.com', 'password123', 'john', 'doe');
  const quiz = quizCreateRequestV2(user.token, 'quiz', 'm eow');
  questionCreateRequestV2(user.token, quiz.quizId, {
    question: 'What course is this?',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'COMP1531', correct: true },
      { answer: 'MATH1081', correct: false }
    ],
    thumbnailUrl: 'http://google.com.jpeg'
  });
  quizSession = quizSessionStartRequest(user.token, quiz.quizId, 5);
});

test('Expected results under normal conditions', () => {
  expect(playerJoinRequest('little jimmy', quizSession.sessionId)).toStrictEqual({ playerId: expect.any(Number) });
});

describe('Throws error under error conditions', () => {
  test('Same name', () => {
    playerJoinRequest('jimmy', quizSession.sessionId);
    expect(playerJoinRequest('jimmy', quizSession.sessionId)).toStrictEqual(ERROR);
  });

  test('Invalid session id', () => {
    const response = playerJoinRequest('jimmy', quizSession.sessionId + 1);
    expect(response).toStrictEqual(ERROR);
  });

  test('Not in lobby state', () => {
    // state changing function needs to be called here
    /* const response = playerJoinRequest('jimmy', quizSession.sessionId);
    expect(response).toStrictEqual(ERROR); */
  });
});
