import {
  userCreateRequest,
  clearRequest,
  questionCreateRequestV2,
  quizCreateRequestV2,
  quizSessionStartRequest,
  playerJoinRequest,
  quizSessionStateUpdateRequest,
  playerSubmitRequest,
  playerQuestionInfoRequest,
  playerQuestionResultsRequest
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
  playerSubmitRequest([answers1.answer1], player.playerId, 1);
  playerSubmitRequest([answers1.answer2], player2.playerId, 1);
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
});

test('Expected behaviour', () => {
  expect(playerQuestionResultsRequest(player.playerId, 1)).toStrictEqual({
    questionId: expect.any(Number),
    playersCorrectList: ['jimmy'],
    averageAnswerTime: expect.any(Number),
    percentCorrect: 50
  });
});

test('nonexistant id', () => {
  const nonid = Math.max(player.playerId, player2.playerId) + 1;
  expect(playerQuestionResultsRequest(nonid, 1)).toStrictEqual(ERROR);
});

test('bad question position', () => {
  expect(playerQuestionResultsRequest(player.playerId, 2)).toStrictEqual(ERROR);
  expect(playerQuestionResultsRequest(player.playerId, 3)).toStrictEqual(ERROR);
});

test('Wrong quiz session state', () => {
  quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'END');
  expect(playerQuestionResultsRequest(player.playerId, 1)).toStrictEqual(ERROR);
});
