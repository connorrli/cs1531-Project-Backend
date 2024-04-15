import {
  quizSessionStartRequest,
  sendChatMessage,
  playerJoinRequest,
  clearRequest,
  userCreateRequest,
  quizCreateRequestV2,
  questionCreateRequestV2
} from '../requests';

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
  const response = sendChatMessage(playerId1, 'hello');
  expect(response).toStrictEqual(ERROR);
});

test('Message < 1 character', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const response = sendChatMessage(guest1.playerId, '');
  expect(response).toStrictEqual(ERROR);
});

test('Message > 100 character', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const response = sendChatMessage(guest1.playerId, 'qewdqwdqwdq wqdqwdqwdqbhnid dqiowhdioqwhodiqhw dioqhwdoiqwhdihqoilwdhoq iqahfaewfwaefqfwfwqfqwfqwfqndoiqwh');
  expect(response).toStrictEqual(ERROR);
});

test('Correct output', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const response = sendChatMessage(guest1.playerId, 'hello my friends');
  expect(response).toStrictEqual({ });
});

test('2 guest players join and send messages', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const guest2 = playerJoinRequest('Snow', quizSession.sessionId);

  const guest1FirstMessage = sendChatMessage(guest1.playerId, 'I am guest 1');
  const guest1SecondMessage = sendChatMessage(guest1.playerId, 'I will be number 1');
  const guest2Message = sendChatMessage(guest2.playerId, 'Guest 2 here');

  expect(guest1FirstMessage).toStrictEqual({ });
  expect(guest1SecondMessage).toStrictEqual({ });
  expect(guest2Message).toStrictEqual({ });
});
