import {
  userCreateRequest,
  quizCreateRequestV2,
  quizSessionStartRequest,
  playerJoinRequest,
  questionCreateRequestV2,
  quizSessionStateUpdateRequest,
  playerQuestionInfoRequest,
  clearRequest
} from '../requests';

let john: { token: string };
let quiz: { quizId: number };
let session: { sessionId: number };
let player: { playerId: number, name: string };

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearRequest();
  john = userCreateRequest('john@gmail.com', 'passssw123', 'Jogn', 'Doe');
  quiz = quizCreateRequestV2(john.token, 'meow', '');

  questionCreateRequestV2(john.token, quiz.quizId, {
    question: 'What course is this?',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'COMP1531', correct: true },
      { answer: 'MATH1081', correct: false }
    ],
    thumbnailUrl: 'http://google.com.jpeg'
  });
  questionCreateRequestV2(john.token, quiz.quizId, {
    question: 'what is F15ABOOST getting in this course',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'HD BABY', correct: true },
      { answer: 'fail', correct: false }
    ],
    thumbnailUrl: 'http://google.com.jpeg'
  });

  session = quizSessionStartRequest(john.token, quiz.quizId, 5);

  player = playerJoinRequest('Little jimmy', session.sessionId);
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
});

test('Correct output under normal conditions', () => {
  expect(playerQuestionInfoRequest(player.playerId, 1)).toStrictEqual({
    questionId: expect.any(Number),
    question: 'What course is this?',
    duration: 10,
    thumbnailUrl: 'http://google.com.jpeg',
    points: 5,
    answers: [{
      answerId: expect.any(Number),
      answer: 'COMP1531',
      colour: expect.any(String)
    }, {
      answerId: expect.any(Number),
      answer: 'MATH1081',
      colour: expect.any(String)
    }]
  });
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
  expect(playerQuestionInfoRequest(player.playerId, 2)).toStrictEqual({
    questionId: expect.any(Number),
    question: 'what is F15ABOOST getting in this course',
    duration: 10,
    thumbnailUrl: 'http://google.com.jpeg',
    points: 5,
    answers: [{
      answerId: expect.any(Number),
      answer: 'HD BABY',
      colour: expect.any(String)
    }, {
      answerId: expect.any(Number),
      answer: 'fail',
      colour: expect.any(String)
    }]
  });
});

test('evil question positions throw error', () => {
  expect(playerQuestionInfoRequest(player.playerId, 2)).toStrictEqual(ERROR);
  expect(playerQuestionInfoRequest(player.playerId, -1)).toStrictEqual(ERROR);
});

test('evil playerid throws an error', () => {
  expect(playerQuestionInfoRequest(player.playerId + 1, 1)).toStrictEqual(ERROR);
});

test('wrong sess state throws error (end state)', () => {
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'END');
  expect(playerQuestionInfoRequest(player.playerId, 1)).toStrictEqual(ERROR);
});

test('wrong sess state throws error (q countdown)', () => {
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
  expect(playerQuestionInfoRequest(player.playerId, 1)).toStrictEqual(ERROR);
});

test('wrong sess state throws error (lobby)', () => {
  const newSession = quizSessionStartRequest(john.token, quiz.quizId, 5);
  const newPlayer = playerJoinRequest('Little jimmy', newSession.sessionId);
  expect(playerQuestionInfoRequest(newPlayer.playerId, 1)).toStrictEqual(ERROR);
});
