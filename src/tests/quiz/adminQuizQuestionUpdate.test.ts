import {
  clearRequest,
  questionCreateRequest,
  questionCreateRequestV2,
  questionUpdateRequest,
  questionUpdateRequestV2,
  quizCreateRequest,
  quizCreateRequestV2,
  quizInfoRequest,
  quizInfoRequestV2,
  userCreateRequest
} from '../requests';
import { QuestionBody, QuestionBodyV2 } from '../../interface';
import { AdminQuizInfoReturn } from '../../Iter3/quizV2';

// Expected Constants
const SUCCESS_RESPONSE = { };
const ERROR = { error: expect.any(String) };

describe('Testing adminQuizQuestionUpdate function:', () => {
  let userToken : string;
  let quizId : number;
  let questionId : number;
  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password123', 'John', 'Doe').token;
    quizId = quizCreateRequest(userToken, 'Test Quiz', 'Test Description').quizId;
    questionId = questionCreateRequest(userToken, quizId, VALID_QUESTION_OBJECT).questionId;
  });

  // Test Constants
  const VALID_QUESTION = 'What is the worst food of the following?';
  const VALID_DURATION = 5;
  const VALID_POINTS_AWARDED = 5;
  const VALID_ANSWERS_ARRAY = [
    {
      answer: 'steak',
      correct: false
    },
    {
      answer: 'anchovies',
      correct: true
    }
  ];

  const VALID_QUESTION_OBJECT = {
    question: VALID_QUESTION,
    duration: VALID_DURATION,
    points: VALID_POINTS_AWARDED,
    answers: VALID_ANSWERS_ARRAY,
  };

  test.each([
    {
      testTitle: 'Valid Question Name Change',
      question: VALID_QUESTION + ' CHANGED',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Duration Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION + 1,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Points Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED + 1,
      answers: VALID_ANSWERS_ARRAY,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Answers Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED + 1,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'burgers',
          correct: false
        },
      ],
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Question String < 5 Characters',
      question: 'Huh?',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Question String > 50 Characters',
      question: '12345678912345678912345678912345678912345678912345?',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Number Of Answers < 2',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'anchovies',
          correct: true
        },
      ],
      expected: ERROR,
    },
    {
      testTitle: 'Number Of Answers > 6',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'burgers',
          correct: false
        },
        {
          answer: 'jerky',
          correct: false
        },
        {
          answer: 'fries',
          correct: false
        },
        {
          answer: 'cereal',
          correct: false
        },
        {
          answer: 'donkey meat',
          correct: false
        },
      ],
      expected: ERROR,
    },
    {
      testTitle: 'Negative Question Duration',
      question: VALID_QUESTION,
      duration: -1,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Sum Of Question Durations > 3 Minutes',
      question: VALID_QUESTION,
      duration: 181,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Points Awarded < 1',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: 0,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Points Awarded > 10',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: 11,
      answers: VALID_ANSWERS_ARRAY,
      expected: ERROR,
    },
    {
      testTitle: 'Length Of Answer < 1',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: '',
          correct: false
        }
      ],
      expected: ERROR
    },
    {
      testTitle: 'Length Of Answer > 30',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: '123456789123456789123456789123?',
          correct: false
        }
      ],
      expected: ERROR
    },
    {
      testTitle: 'Duplicate Answer String (In Same Question)',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'anchovies',
          correct: true
        }
      ],
      expected: ERROR
    },
    {
      testTitle: 'No Correct Answer',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: false
        },
        {
          answer: 'burgers',
          correct: false
        }
      ],
      expected: ERROR
    },
  ])('Testing $testTitle:', ({ question, duration, points, answers, expected }) => {
    const questionBody: QuestionBody = {
      question,
      duration,
      points,
      answers
    };

    const preUpdateQuiz : AdminQuizInfoReturn = quizInfoRequest(quizId, userToken);
    const preUpdateQuestion = preUpdateQuiz.questions.find(question => question.questionId === questionId);

    const response = questionUpdateRequest(userToken, quizId, questionId, questionBody);

    const updatedQuiz : AdminQuizInfoReturn = quizInfoRequest(quizId, userToken);
    const updatedQuestion = updatedQuiz.questions.find(question => question.questionId === questionId);
    if ('error' in response) {
      expect(updatedQuestion).toStrictEqual(preUpdateQuestion);
      expect(updatedQuiz.duration).toStrictEqual(preUpdateQuiz.duration);
    } else {
      expect(updatedQuestion).toStrictEqual({
        questionId: questionId,
        question: question,
        duration: duration,
        points: points,
        answers: expect.any(Object),
      });
      for (const answer of answers) {
        expect(typeof updatedQuestion.answers.find(ans => ans.answer === answer.answer)).not.toStrictEqual('undefined');
      }
      expect(updatedQuiz.duration).toStrictEqual(duration);
    }
    expect(response).toStrictEqual(expected);
  });
  test('User doesn\'t own the quiz:', () => {
    const otherUserToken = userCreateRequest('test1@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const questionBody : QuestionBody = VALID_QUESTION_OBJECT;

    const preUpdateQuiz : AdminQuizInfoReturn = quizInfoRequest(quizId, userToken);
    const preUpdateQuestion = preUpdateQuiz.questions.find(question => question.questionId === questionId);

    const response = questionUpdateRequest(otherUserToken, quizId, questionId, questionBody);

    const updatedQuiz : AdminQuizInfoReturn = quizInfoRequest(quizId, userToken);
    const updatedQuestion = updatedQuiz.questions.find(question => question.questionId === questionId);

    expect(updatedQuestion).toStrictEqual(preUpdateQuestion);
    expect(updatedQuiz.duration).toStrictEqual(preUpdateQuiz.duration);
    expect(response).toStrictEqual(ERROR);
  });
});

describe('Testing adminQuizQuestionUpdateV2 function:', () => {
  let userToken : string;
  let quizId : number;
  let questionId : number;
  beforeEach(() => {
    clearRequest();
    userToken = userCreateRequest('test@gmail.com', 'Password123', 'John', 'Doe').token;
    quizId = quizCreateRequestV2(userToken, 'Test Quiz', 'Test Description').quizId;
    questionId = questionCreateRequestV2(userToken, quizId, VALID_QUESTION_OBJECT).questionId;
  });

  // Test Constants
  const VALID_THUMBNAIL_URL = 'https://example/path/images/bruh.png';
  const VALID_QUESTION = 'What is the worst food of the following?';
  const VALID_DURATION = 5;
  const VALID_POINTS_AWARDED = 5;
  const VALID_ANSWERS_ARRAY = [
    {
      answer: 'steak',
      correct: false
    },
    {
      answer: 'anchovies',
      correct: true
    }
  ];

  const VALID_QUESTION_OBJECT = {
    question: VALID_QUESTION,
    duration: VALID_DURATION,
    points: VALID_POINTS_AWARDED,
    answers: VALID_ANSWERS_ARRAY,
    thumbnailUrl: VALID_THUMBNAIL_URL
  };

  test.each([
    {
      testTitle: 'Valid Question Name Change',
      question: VALID_QUESTION + ' CHANGED',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Duration Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION + 1,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Points Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED + 1,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Valid Question Answers Change',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED + 1,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'burgers',
          correct: false
        },
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: SUCCESS_RESPONSE,
    },
    {
      testTitle: 'Question String < 5 Characters',
      question: 'Huh?',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Question String > 50 Characters',
      question: '12345678912345678912345678912345678912345678912345?',
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Number Of Answers < 2',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'anchovies',
          correct: true
        },
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Number Of Answers > 6',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'burgers',
          correct: false
        },
        {
          answer: 'jerky',
          correct: false
        },
        {
          answer: 'fries',
          correct: false
        },
        {
          answer: 'cereal',
          correct: false
        },
        {
          answer: 'donkey meat',
          correct: false
        },
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Negative Question Duration',
      question: VALID_QUESTION,
      duration: -1,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Sum Of Question Durations > 3 Minutes',
      question: VALID_QUESTION,
      duration: 181,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Points Awarded < 1',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: 0,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Points Awarded > 10',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: 11,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR,
    },
    {
      testTitle: 'Length Of Answer < 1',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: '',
          correct: false
        }
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR
    },
    {
      testTitle: 'Length Of Answer > 30',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: '123456789123456789123456789123?',
          correct: false
        }
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR
    },
    {
      testTitle: 'Duplicate Answer String (In Same Question)',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: true
        },
        {
          answer: 'anchovies',
          correct: true
        }
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR
    },
    {
      testTitle: 'No Correct Answer',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: [
        {
          answer: 'steak',
          correct: false
        },
        {
          answer: 'anchovies',
          correct: false
        },
        {
          answer: 'burgers',
          correct: false
        }
      ],
      thumbnailUrl: VALID_THUMBNAIL_URL,
      expected: ERROR
    },
    {
      testTitle: 'Invalid Thumbnail URL (does not begin with https:// or http://',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: 'www.example.com/test/path.jpg',
      expected: ERROR,
    },
    {
      testTitle: 'Invalid Thumbnail URL (does not end with jpeg, jpg or png',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: 'https://example.com/test/path.pdf',
      expected: ERROR,
    },
    {
      testTitle: 'Invalid Thumbnail URL (empty)',
      question: VALID_QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS_AWARDED,
      answers: VALID_ANSWERS_ARRAY,
      thumbnailUrl: '',
      expected: ERROR,
    }
  ])('Testing $testTitle:', ({ question, duration, points, answers, thumbnailUrl, expected }) => {
    const questionBody: QuestionBodyV2 = {
      question,
      duration,
      points,
      answers,
      thumbnailUrl
    };

    const preUpdateQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const preUpdateQuestion = preUpdateQuiz.questions.find(question => question.questionId === questionId);

    const response = questionUpdateRequestV2(userToken, quizId, questionId, questionBody);
    
    const updatedQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const updatedQuestion = updatedQuiz.questions.find(question => question.questionId === questionId);
    if ('error' in response) {
      expect(updatedQuestion).toStrictEqual(preUpdateQuestion);
      expect(updatedQuiz.duration).toStrictEqual(preUpdateQuiz.duration);
    } else {
      expect(updatedQuestion).toStrictEqual({
        questionId: questionId,
        question: question,
        duration: duration,
        points: points,
        answers: expect.any(Object),
        thumbnailUrl: thumbnailUrl,
      });
      for (const answer of answers) {
        expect(typeof updatedQuestion.answers.find(ans => ans.answer === answer.answer)).not.toStrictEqual('undefined');
      }
      expect(updatedQuiz.duration).toStrictEqual(duration);
    }
    expect(response).toStrictEqual(expected);
  });
  test('User doesn\'t own the quiz:', () => {
    const otherUserToken = userCreateRequest('test1@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const questionBody : QuestionBodyV2 = VALID_QUESTION_OBJECT;

    const preUpdateQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const preUpdateQuestion = preUpdateQuiz.questions.find(question => question.questionId === questionId);

    const response = questionUpdateRequestV2(otherUserToken, quizId, questionId, questionBody);

    const updatedQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const updatedQuestion = updatedQuiz.questions.find(question => question.questionId === questionId);

    expect(updatedQuestion).toStrictEqual(preUpdateQuestion);
    expect(updatedQuiz.duration).toStrictEqual(preUpdateQuiz.duration);
    expect(response).toStrictEqual(ERROR);
  });
  test('Invalid quiz or question:', () => {
    const otherUserToken = userCreateRequest('test1@gmail.com', 'Password123', 'Jane', 'Doe').token;
    const questionBody : QuestionBodyV2 = VALID_QUESTION_OBJECT;

    const preUpdateQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const preUpdateQuestion = preUpdateQuiz.questions.find(question => question.questionId === questionId);

    const response = questionUpdateRequestV2(otherUserToken, quizId + 1, questionId, questionBody);
    const response2 = questionUpdateRequestV2(otherUserToken, quizId, questionId + 1, questionBody);

    const updatedQuiz : AdminQuizInfoReturn = quizInfoRequestV2(userToken, quizId);
    const updatedQuestion = updatedQuiz.questions.find(question => question.questionId === questionId);

    expect(updatedQuestion).toStrictEqual(preUpdateQuestion);
    expect(updatedQuiz.duration).toStrictEqual(preUpdateQuiz.duration);
    expect(response).toStrictEqual(ERROR);
    expect(response2).toStrictEqual(ERROR);
  });
});