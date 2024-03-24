import { 
    QuestionBody, 
    clearRequest, 
    questionCreateRequest, 
    quizCreateRequest, 
    userCreateRequest 
} from '../requests';

// Expected Constants
const SUCCESS_RESPONSE = { questionId: expect.any(Number) };
const ERROR = { error: expect.any(String) };

describe('Testing adminQuizQuestionCreate function:', () => {
    let userToken : string;
    let quizId : number;
    beforeEach(() => {
        clearRequest(); 
        userToken = userCreateRequest('test@gmail.com', 'Password123', 'John', 'Doe').token;
        quizId = quizCreateRequest(userToken, 'Test Quiz', 'Test Description').quizId;
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

    test.each([
        {
            testTitle: 'Valid Question', 
            question: VALID_QUESTION,
            duration: VALID_DURATION,
            points: VALID_POINTS_AWARDED,
            answers: VALID_ANSWERS_ARRAY,
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
    ])('Testing $testTitle', ({question, duration, points, answers, expected}) => {
        const questionBody: QuestionBody = {
            question,
            duration,
            points,
            answers
        };

        const response = questionCreateRequest(userToken, quizId, questionBody);
        expect(response).toStrictEqual(expected);
    });
});