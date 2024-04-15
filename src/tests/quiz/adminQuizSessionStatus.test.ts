import { QuestionBodyV2 } from '../../interface';
import { clearRequest, quizSessionStatusRequest, quizSessionStartRequest, userCreateRequest, quizCreateRequestV2, questionCreateRequestV2 } from '../requests';

const ERROR_RESPONSE = { error: expect.any(String) };

describe('Testing adminQuizSessionStatus function:', () => {
  let userToken: string;
  let quizId: number;
  let sessionId: number;

  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password12345', 'John', 'Doe').token;
    quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;

    // The quiz needs some questions otherwise adminQuizSessionStart has a tantrum
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

    sessionId = quizSessionStartRequest(userToken, quizId, 5).sessionId;
  });

  test('Success Case: Get status of a quiz session', () => {
    const response = quizSessionStatusRequest(userToken, quizId, sessionId);
    expect(response).toHaveProperty('state');
    expect(response).toHaveProperty('atQuestion');
    expect(response).toHaveProperty('players');
    expect(response).toHaveProperty('metadata');
    expect(response.state).toBeDefined();
    expect(response.atQuestion).toBeDefined();
    expect(response.players).toBeDefined();
    expect(response.metadata).toBeDefined();
  });

  test('Error Case: Get status with invalid sessionId', () => {
    const invalidSessionId = sessionId + 1;
    const response = quizSessionStatusRequest(userToken, quizId, invalidSessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get status with invalid token', () => {
    const invalidToken = 'invalid_token';
    const response = quizSessionStatusRequest(invalidToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get status with blank token', () => {
    const blankToken = '';
    const response = quizSessionStatusRequest(blankToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });

  test('Error Case: Get status without required permissions', () => {
    const secondUserToken = userCreateRequest('another@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const response = quizSessionStatusRequest(secondUserToken, quizId, sessionId);
    expect(response).toEqual(ERROR_RESPONSE);
  });
});
