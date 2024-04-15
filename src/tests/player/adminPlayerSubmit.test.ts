import {
  userCreateRequest,
  clearRequest,
  questionCreateRequestV2,
  quizCreateRequestV2,
  quizSessionStartRequest,
  playerJoinRequest,
  quizSessionStateUpdateRequest,
  playerSubmitRequest,
  playerQuestionInfoRequest
} from '../requests';

const ERROR = { error: expect.any(String) };

let john: { token: string };
let quiz: { quizId: number };
let session: { sessionId: number };
let player: { playerId: number };
let player2: { playerId: number };
let answers1: { answer1: number, answer2: number };

beforeEach(() => {
  clearRequest();
  john = userCreateRequest('johndoe@gmail.com', 'passw1234', 'john', 'doe');
  quiz = quizCreateRequestV2(john.token, 'Johns quiz', '');
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
  player = playerJoinRequest('jimmy', session.sessionId);
  player2 = playerJoinRequest('jimmytwo', session.sessionId);
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
  const answers = playerQuestionInfoRequest(player.playerId, 1).answers;
  answers1 = { answer1: answers[0].answerId, answer2: answers[1].answerId };
});

test('Success conditions', () => {
  expect(playerSubmitRequest([answers1.answer1], player.playerId, 1)).toStrictEqual({});
  expect(playerSubmitRequest([answers1.answer1, answers1.answer2], player.playerId, 1)).toStrictEqual({});
  expect(playerSubmitRequest([answers1.answer2], player.playerId, 1)).toStrictEqual({});
});
test('Success conditions with two players', () => {
  expect(playerSubmitRequest([answers1.answer1], player.playerId, 1)).toStrictEqual({});
  expect(playerSubmitRequest([answers1.answer1], player2.playerId, 1)).toStrictEqual({});
});

test('Error conditions - bad playerid', () => {
  expect(playerSubmitRequest([answers1.answer1], player.playerId + 1, 1)).toStrictEqual(ERROR);
});

test('Error conditions - invalid question position', () => {
  expect(playerSubmitRequest([answers1.answer1], player.playerId, 3)).toStrictEqual(ERROR);
});

test('Error conditions - wrong session state', () => {
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'END');
  expect(playerSubmitRequest([answers1.answer1], player.playerId, 1)).toStrictEqual(ERROR);
});

test('Error conditions - quiz not up to this q', () => {
  expect(playerSubmitRequest([answers1.answer1], player.playerId, 2)).toStrictEqual(ERROR);
});

test('Error conditions - answer id invalid', () => {
  expect(playerSubmitRequest([answers1.answer1 + 1, answers1.answer2 + 1], player.playerId, 1)).toStrictEqual(ERROR);
});

test('Error conditions - dupe answer ids', () => {
  expect(playerSubmitRequest([answers1.answer1, answers1.answer1], player.playerId, 1)).toStrictEqual(ERROR);
});

test('Error conditions - empty array', () => {
  expect(playerSubmitRequest([], player.playerId, 1)).toStrictEqual(ERROR);
});
