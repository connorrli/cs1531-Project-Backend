import { QuestionBodyV2 } from '../../interface';
import { clearRequest, quizSessionResultsCsvRequest, quizSessionStartRequest, userCreateRequest, quizCreateRequestV2, questionCreateRequestV2, quizSessionStatusRequest } from '../requests';
import { playerJoinRequest, quizSessionStateUpdateRequest, playerQuestionInfoRequest, playerSubmitRequest } from '../requests';

const ERROR_RESPONSE = { error: expect.any(String) };
const VALID_URL = { url: expect.any(String) };

enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

describe('Testing adminQuizSessionResults function ERROR CASES:', () => {
  let userToken: string;
  let quizId: number;
  let sessionId: number;

  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password12345', 'John', 'Doe').token;
    quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;

    const questionBody1 : QuestionBodyV2 = {
      question: 'What is your name?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'John',
          correct: false
        },
        {
          answer: 'Scoopity Poop',
          correct: false
        },
        {
          answer: 'MAH DRILLA',
          correct: true
        }
      ],
      thumbnailUrl: 'https://example.com/path/images/bruh.png',
    };

    const questionBody2 : QuestionBodyV2 = {
      question: 'What is your favourite hobby?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Pooping',
          correct: false
        },
        {
          answer: 'Valorant',
          correct: false
        },
        {
          answer: 'Fortnite',
          correct: true
        }
      ],
      thumbnailUrl: 'https://example.com/path/images/bruh.png',
    };

    const questionBody3 : QuestionBodyV2 = {
      question: 'What\'s your favourite song?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: '10 hours of teethbrushing ASMR',
          correct: true
        },
        {
          answer: 'fireplace sounds ASMR',
          correct: false
        },
        {
          answer: 'Ice Spice - Munch',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/path/images/bruh.png',
    };

    questionCreateRequestV2(userToken, quizId, questionBody1);
    questionCreateRequestV2(userToken, quizId, questionBody2);
    questionCreateRequestV2(userToken, quizId, questionBody3);

    sessionId = quizSessionStartRequest(userToken, quizId, 1).sessionId;
  });

  test('Error Case: Get results with invalid sessionId', () => {
    const invalidSessionId = sessionId + 1;
    const response = quizSessionResultsCsvRequest(userToken, quizId, invalidSessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results with invalid token', () => {
    const invalidToken = 'invalid_token';
    const response = quizSessionResultsCsvRequest(invalidToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results with blank token', () => {
    const blankToken = '';
    const response = quizSessionResultsCsvRequest(blankToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results without being owner', () => {
    const secondUserToken = userCreateRequest('another@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const response = quizSessionResultsCsvRequest(secondUserToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results while session is not in FINAL_RESULTS state', () => {
    expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).not.toStrictEqual(States.FINAL_RESULTS);
    const response = quizSessionResultsCsvRequest(userToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });
});

describe('Testing adminQuizSessionResultsCsv function SUCCESS CASE:', () => {
  let john: { token: string };
  let quiz: { quizId: number };
  let session: { sessionId: number };
  let player: { playerId: number };
  let player2: { playerId: number };
  let player3: { playerId: number };
  let answers1: { answer1: number, answer2: number };
  let answers2: { answer1: number, answer2: number };

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
    player3 = playerJoinRequest('scuppy', session.sessionId);
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
    const answers1Array = playerQuestionInfoRequest(player.playerId, 1).answers;
    answers1 = { answer1: answers1Array[0].answerId, answer2: answers1Array[1].answerId };
    playerSubmitRequest([answers1.answer1], player.playerId, 1);
    playerSubmitRequest([answers1.answer2], player2.playerId, 1);
    playerSubmitRequest([answers1.answer1], player3.playerId, 1);
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'NEXT_QUESTION');
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'SKIP_COUNTDOWN');
    const answers2Array = playerQuestionInfoRequest(player.playerId, 2).answers;
    answers2 = { answer1: answers2Array[0].answerId, answer2: answers2Array[1].answerId };
    playerSubmitRequest([answers2.answer1], player.playerId, 2);
    playerSubmitRequest([answers2.answer2], player2.playerId, 2);
    playerSubmitRequest([answers2.answer2], player3.playerId, 2);
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_ANSWER');
    quizSessionStateUpdateRequest(john.token, quiz.quizId, session.sessionId, 'GO_TO_FINAL_RESULTS');
  });
  test('Expected behaviour', () => {
    expect(quizSessionResultsCsvRequest(john.token, quiz.quizId, session.sessionId)).toStrictEqual(
      // This should be changed to an object rather than just a string
      VALID_URL
    );
  });
});
