import { QuestionBodyV2 } from "../../interface";
import { 
  clearRequest, 
  questionCreateRequestV2,
  quizCreateRequestV2,
  quizSessionStartRequest,
  quizSessionStateUpdateRequest,
  quizSessionsRequest,
  userCreateRequest 
} from "../requests";

const ERROR = { error: expect.any(String) };

describe('Testing adminQuizSessions function:', () => {
  let quizId: number;
  let userToken: string;
  let question1 : QuestionBodyV2;
  let question2 : QuestionBodyV2;
  let session1 : number;
  let session2 : number; 
  let session3 : number;
  let session4 : number;
  let session5 : number; 
  let session6 : number;

  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password12345', 'John', 'Doe').token;
    quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;

    question1 = {
      question: 'Test question?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Yes, test question.',
          correct: true
        },
        {
          answer: 'No, not test question',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/images/bruh.png'
    }

    question2 = {
      question: 'Test question?',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Yes, test question.',
          correct: true
        },
        {
          answer: 'No, not test question',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/images/bruh.png'
    }

    questionCreateRequestV2(userToken, quizId, question1);
    questionCreateRequestV2(userToken, quizId, question2);

    session1 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
    session2 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
    session3 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
    session4 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
    session5 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
    session6 = quizSessionStartRequest(userToken, quizId, 5).sessionId;
  });

  test('Valid adminQuizSessions call (3 active, 3 inactive)', () => {
    quizSessionStateUpdateRequest(userToken, quizId, session1, 'END');
    quizSessionStateUpdateRequest(userToken, quizId, session3, 'END');
    quizSessionStateUpdateRequest(userToken, quizId, session5, 'END');

    const response = quizSessionsRequest(userToken, quizId);

    expect(response).toStrictEqual({
      activeSessions: [
        2,
        4,
        6
      ],
      inactiveSessions: [
        1,
        3,
        5
      ]
    });
  });
  test('Invalid adminQuizSessions call (Invalid Token)', () => {
    const response = quizSessionsRequest(userToken + 1, quizId);
    expect(response).toStrictEqual(ERROR);
  });
  test('Invalid adminQuizSessions call (Not Owner)', () => {
    const userToken2 = userCreateRequest('johndoe@gmail.com', 'Password12345', 'John', 'Doe');
    const response = quizSessionsRequest(userToken2, quizId);
    expect(response).toStrictEqual(ERROR);
  });
  test('Invalid adminQuizSessions call (Invalid Quiz)', () => {
    const response = quizSessionsRequest(userToken, quizId + 1);
    expect(response).toStrictEqual(ERROR);
  });
});