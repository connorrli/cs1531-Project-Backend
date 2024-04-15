import { QuestionBodyV2 } from '../../interface';
import { clearRequest, quizSessionResultsRequest, quizSessionStartRequest, userCreateRequest, quizCreateRequestV2, questionCreateRequestV2, quizSessionStatusRequest } from '../requests';

const ERROR_RESPONSE = { error: expect.any(String) };

enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

describe('Testing adminQuizSessionResults function:', () => {
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

  test('Success Case: Get final results for a completed quiz session', () => {
    const response = quizSessionResultsRequest(userToken, quizId, sessionId);
    expect(response).toHaveProperty('usersRankedByScore');
    expect(response).toHaveProperty('questionResults');
  });

  test('Error Case: Get results with invalid sessionId', () => {
    const invalidSessionId = sessionId + 1;
    const response = quizSessionResultsRequest(userToken, quizId, invalidSessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results with invalid token', () => {
    const invalidToken = 'invalid_token';
    const response = quizSessionResultsRequest(invalidToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results with blank token', () => {
    const blankToken = '';
    const response = quizSessionResultsRequest(blankToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results without being owner', () => {
    const secondUserToken = userCreateRequest('another@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const response = quizSessionResultsRequest(secondUserToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get results while session is not in FINAL_RESULTS state', () => {
    expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).not.toStrictEqual(States.FINAL_RESULTS);
    const response = quizSessionResultsRequest(userToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

});
