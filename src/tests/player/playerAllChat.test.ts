import {
  quizSessionStartRequest,
  allChatMessages,
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
  const response = allChatMessages(playerId1);
  expect(response).toStrictEqual(ERROR);
});

test('Correct output for 1 message from 1 player', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  sendChatMessage(guest1.playerId, 'hello');

  const response = allChatMessages(guest1.playerId);
  console.log(response);

  expect(response).toStrictEqual({
    messages: [
      {
        messageBody: 'hello',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number),
      }
    ]
  });
});

test('3 consecutive messages from 1 player', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  sendChatMessage(guest1.playerId, 'hello');
  sendChatMessage(guest1.playerId, 'my name is John');
  sendChatMessage(guest1.playerId, 'the weather is good today');

  const response = allChatMessages(guest1.playerId);
  console.log(response);

  expect(response).toStrictEqual({
    messages: [
      {
        messageBody: 'hello',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number),
      },
      {
        messageBody: 'my name is John',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number),
      },
      {
        messageBody: 'the weather is good today',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number),
      }
    ]
  });
});

test('2 guest players join and send messages', () => {
  const guest1 = playerJoinRequest('John', quizSession.sessionId);
  const guest2 = playerJoinRequest('Snow', quizSession.sessionId);

  sendChatMessage(guest1.playerId, 'I am guest 1');
  sendChatMessage(guest1.playerId, 'I will be number 1');
  sendChatMessage(guest2.playerId, 'Guest 2 here');

  const response1 = allChatMessages(guest1.playerId);
  const response2 = allChatMessages(guest2.playerId);

  expect(response1).toStrictEqual({
    messages: [
      {
        messageBody: 'I am guest 1',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number)
      },
      {
        messageBody: 'I will be number 1',
        playerId: expect.any(Number),
        playerName: 'John',
        timeSent: expect.any(Number)
      },
      {
        messageBody: 'Guest 2 here',
        playerId: expect.any(Number),
        playerName: 'Snow',
        timeSent: expect.any(Number)
      }
    ]
  });
});
