import {
  clearRequest,
  userCreateRequest,
  quizCreateRequest,
  questionCreateRequest,
  quizInfoRequest,
  questionMoveRequest
} from '../requests';

let john: { token: string };
let quiz: { quizId: number };
let question1: { questionId: number };
let question2: { questionId: number };
let question3: { questionId: number };
const questionBody1 = {
  question: 'who up lol',
  duration: 5,
  points: 5,
  answers: [
    { answer: 'meee ahaah', correct: true },
    { answer: 'bro what the hell', correct: false }
  ]
};
const questionBody2 = {
  question: 'but seriously who is up',
  duration: 5,
  points: 5,
  answers: [
    { answer: 'i just said i was', correct: true },
    { answer: 'i thought this was a geo quiz', correct: false }
  ]
};
const questionBody3 = {
  question: 'fine here is ya bloody geography question',
  duration: 5,
  points: 5,
  answers: [
    { answer: 'canberra is in west bengal', correct: true },
    { answer: 'russia is a big whale', correct: false }
  ]
};

const thisWillBeUsefulLater: number = Math.floor(Date.now() / 1000);
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearRequest();
  john = userCreateRequest('johndoe@gmail.com', 'password123', 'john', 'doe');
  quiz = quizCreateRequest(john.token, 'boring quiz', 'loveless and lifeless');
  question1 = questionCreateRequest(john.token, quiz.quizId, questionBody1);
  question2 = questionCreateRequest(john.token, quiz.quizId, questionBody2);
  question3 = questionCreateRequest(john.token, quiz.quizId, questionBody3);
});

describe('Expected behaviour under success', () => {
  test('Moves questions around nicely', () => {
    questionMoveRequest(john.token, quiz.quizId, question2.questionId, 0);
    const quizInfo = quizInfoRequest(quiz.quizId, john.token);
    expect(quizInfo.questions[0].questionId).toEqual(question2.questionId);
    questionMoveRequest(john.token, quiz.quizId, question1.questionId, 0);
    const quizInfo2 = quizInfoRequest(quiz.quizId, john.token);
    expect(quizInfo2.questions[0].questionId).toEqual(question1.questionId);
  });
});

describe('Expected behaviour if requests are weird', () => {
  test('invalid token should result in error', () => {
    const idBefore = quizInfoRequest(quiz.quizId, john.token).questions[0].questionId;
    const result = questionMoveRequest(john.token + '1', quiz.quizId, question2.questionId, 0);
    const idAfter = quizInfoRequest(quiz.quizId, john.token).questions[0].questionId;
    expect(idBefore).toEqual(idAfter);
    expect(result).toStrictEqual(ERROR);
  });
  test('invalid wanted place should result in error', () => {
    const quizInfoPrior = quizInfoRequest(quiz.quizId, john.token);
    const result1 = questionMoveRequest(john.token, quiz.quizId, question2.questionId, -1);
    const result2 = questionMoveRequest(john.token, quiz.quizId, question2.questionId, 3);
    expect(result1).toStrictEqual(ERROR);
    expect(result2).toStrictEqual(ERROR);
    expect(quizInfoRequest(quiz.quizId, john.token)).toStrictEqual(quizInfoPrior);
  });
  test('invalid quizId should result in error', () => {
    const result = questionMoveRequest(john.token, quiz.quizId + 1, question2.questionId, 0);
    expect(result).toStrictEqual(ERROR);
  });
  test('invalid questionId should result in error', () => {
    const result = questionMoveRequest(john.token, quiz.quizId,
      Math.max(question2.questionId, question1.questionId, question3.questionId) + 1, 0);
    expect(result).toStrictEqual(ERROR);
  });
});

/*describe('lets hope its been more than a second', () => {
  for (let justForGoodMeasure = 0; justForGoodMeasure < 1000000000; justForGoodMeasure++) {
    // this may be a bad idea
  }
  test('should affect timeLastEdited', () => {
    questionMoveRequest(john.token, quiz.quizId, question2.questionId, 0);
    const quizInfo = quizInfoRequest(quiz.quizId, john.token);
    expect(quizInfo.timeLastEdited).toBeGreaterThan(thisWillBeUsefulLater);
  });
});*/

//^ THE ABOVE CONSISTANTLY PASSES but lets be real im not comfortable with this ahahah
