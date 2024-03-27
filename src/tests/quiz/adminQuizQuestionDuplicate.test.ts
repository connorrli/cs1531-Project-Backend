import {
  clearRequest,
  questionCreateRequest,
  quizCreateRequest,
  userCreateRequest,
  questionDuplicateRequest
} from '../requests';
import { QuestionBody } from '../../interface';

const ERROR = { error: expect.any(String) };

describe('Testing adminQuizQuestionDuplicate function', () => {
  let userToken: string;
  let user2Token: string;
  let quizId: number;
  let quiz2Id: number;
  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password123', 'John', 'Doe').token;
    user2Token = userCreateRequest('test2@example.com', 'password123', 'Jane', 'Smith').token;
    quizId = quizCreateRequest(userToken, 'Test Quiz', 'Test Description').quizId;
    quiz2Id = quizCreateRequest(user2Token, 'Test Quiz 2', 'This is a test quiz').quizId;
  });

  test('Should duplicate a question in a quiz owned by the user', () => {
    const questionBody: QuestionBody = {
      question: 'What course is this?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'COMP1531', correct: true },
        { answer: 'MATH1081', correct: false }
      ]
    };
    const question = questionCreateRequest(userToken, quizId, questionBody);
    if ('questionId' in question) {
      const response = questionDuplicateRequest(userToken, quizId, question.questionId);
      expect(response).toHaveProperty('newQuestionId', expect.any(Number));
    }
  });

  test('Should return an error when token is empty or invalid', () => {
    const questionBody: QuestionBody = {
      question: 'What course is this?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'COMP1531', correct: true },
        { answer: 'MATH1081', correct: false }
      ]
    };
    const question = questionCreateRequest(userToken, quizId, questionBody);
    if ('questionId' in question) {
      const response1 = questionDuplicateRequest('', quizId, question.questionId);
      const response2 = questionDuplicateRequest(userToken + '1', quizId, question.questionId);
      expect(response1).toStrictEqual(ERROR);
      expect(response2).toStrictEqual(ERROR);
    }
  });

  test('Should return an error when questionId does not refer to a valid question within the quiz', () => {
    const response = questionDuplicateRequest(userToken, quizId, 123);
    expect(response).toStrictEqual(ERROR);
  });

  test('Should return an error when quizId is invalid or the user does not own the quiz', () => {
    const questionBody: QuestionBody = {
      question: 'What course is this?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'COMP1531', correct: true },
        { answer: 'MATH1081', correct: false }
      ]
    };
    const question = questionCreateRequest(userToken, quizId, questionBody);
    if ('questionId' in question) {
      const response1 = questionDuplicateRequest(user2Token, quizId, question.questionId);
      const response2 = questionDuplicateRequest(userToken, quiz2Id, question.questionId);
      expect(response1).toStrictEqual(ERROR);
      expect(response2).toStrictEqual(ERROR);
    }
  });
});
