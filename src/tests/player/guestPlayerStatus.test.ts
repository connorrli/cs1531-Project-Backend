import {
  quizSessionStartRequest,
  guestPlayerStatus,
  playerJoinRequest,
  clearRequest,
  userCreateRequest,
  quizCreateRequestV2,
  questionCreateRequestV2,
  quizInfoRequestV2,
  quizSessionStateUpdateRequest
} from '../requests';

enum Actions {
    NEXT_QUESTION = 'NEXT_QUESTION',
    SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
    GO_TO_ANSWER = 'GO_TO_ANSWER',
    GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
    END = 'END'
}

enum States {
    LOBBY = 'LOBBY',
    QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
    QUESTION_OPEN = 'QUESTION_OPEN',
    QUESTION_CLOSE = 'QUESTION_CLOSE',
    ANSWER_SHOW = 'ANSWER_SHOW',
    FINAL_RESULTS = 'FINAL_RESULTS',
    END = 'END'
}

const ERROR = { error: expect.any(String) };

let userToken : string;
let quizId : number;
let quizSession: { sessionId: number };

beforeEach(() => {
  clearRequest();
  userToken = userCreateRequest('test@gmail.com', 'Password1234', 'John', 'Doe').token;
  quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;
  questionCreateRequestV2(userToken, quizId, {
    question: 'What colour is the sky?',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'Blue', correct: true },
      { answer: 'Green', correct: false }
    ],
    thumbnailUrl: 'http://google.com.jpeg'
  });
  quizSession = quizSessionStartRequest(userToken, quizId, 5);
});

test('Invalid playerId', () => {
  const playerId1 = 123;
  const response = guestPlayerStatus(playerId1);
  expect(response).toStrictEqual(ERROR);
});

test('Correct output for 1 guest player', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const quizInfo = quizInfoRequestV2(userToken, quizId);

  const response = guestPlayerStatus(guest1.playerId);
  expect(response).toStrictEqual({
    state: States.LOBBY,
    numQuestions: quizInfo.numQuestions,
    atQuestion: 0
  });
});

test('Correct output for 2 guest player', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const guest2 = playerJoinRequest('Snow', quizSession.sessionId);
  const quizInfo = quizInfoRequestV2(userToken, quizId);

  const response1 = guestPlayerStatus(guest1.playerId);
  const response2 = guestPlayerStatus(guest2.playerId);

  expect(response1).toStrictEqual({
    state: States.LOBBY,
    numQuestions: quizInfo.numQuestions,
    atQuestion: 0
  });
  expect(response2).toStrictEqual({
    state: States.LOBBY,
    numQuestions: quizInfo.numQuestions,
    atQuestion: 0
  });
});

test('Check if items are correctly updated after moving to next phase', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const quizInfo = quizInfoRequestV2(userToken, quizId);
  quizSessionStateUpdateRequest(userToken, quizId, quizSession.sessionId, Actions.NEXT_QUESTION);

  const response1 = guestPlayerStatus(guest1.playerId);

  expect(response1).toStrictEqual({
    state: States.QUESTION_COUNTDOWN,
    numQuestions: quizInfo.numQuestions,
    atQuestion: 1
  });
});
