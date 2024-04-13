import { QuestionBodyV2 } from "../../interface";
import { clearRequest, questionCreateRequestV2, quizCreateRequestV2, quizSessionStartRequest, quizSessionStateUpdateRequest, userCreateRequest } from "../requests";

const SUCCESS_RESPONSE = {};
const ERROR_RESPONSE = { error: expect.any(String) };

// Take into account a maximum latency of 100ms (anything beyond this is probably abnormal)
const LATENCY_FACTOR = 100;

// Temporarily commented out until session status route is implemented
/* enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
} */

enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

describe('Testing adminQuizSessionStateUpdate function:', () => {
  let userToken : string;
  let quizId : number;
  let sessionId : number;
  let questionId1 : number;
  let questionId2 : number;
  let questionId3 : number;
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
    }

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
    }

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
    }

    questionId1 = questionCreateRequestV2(userToken, quizId, questionBody1).questionId;
    questionId2 = questionCreateRequestV2(userToken, quizId, questionBody2).questionId;
    questionId3 = questionCreateRequestV2(userToken, quizId, questionBody3).questionId;

    sessionId = quizSessionStartRequest(userToken, quizId, 5).sessionId;
  });
  describe('Testing NEXT_QUESTION action', () => {
    test('NEXT_QUESTION action (Valid)', () => {
      /*-------------------------------------
      | LOBBY -> QUESTION_COUNTDOWN 
      ---------------------------------------*/
      
      // Begin quiz (in QUESTION_COUNTDOWN state)
      const stateChangeResponse1 = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(stateChangeResponse1).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_COUNTDOWN);
      sleepSync(3 * 1000 + LATENCY_FACTOR);
  
      // Question is open (in QUESTION_OPEN state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_OPEN);
      sleepSync(1 * 1000 + LATENCY_FACTOR);
  
      /*-------------------------------------
      | QUESTION_CLOSE -> QUESTION_COUNTDOWN
      ---------------------------------------*/
  
      // Question is closed (in QUESTION_CLOSE state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_CLOSE);
  
      // Go to next question
      const stateChangeRequest2 = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(stateChangeRequest2).toStrictEqual(SUCCESS_RESPONSE);
  
      // Countdown (in QUESTION_COUNTDOWN state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_COUNTDOWN);
  
      // Skip countdown
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
  
      // Question is open (in QUESTION_OPEN state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_OPEN);
      sleepSync(1 * 1000 + LATENCY_FACTOR);
  
      // Question is closed (in QUESTION_CLOSE state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_CLOSE);
      
      /*-------------------------------------
      | ANSWER_SHOW -> QUESTION_COUNTDOWN
      ---------------------------------------*/
  
      // Go to answer
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_ANSWER);

  
      // Showing answer (in ANSWER_SHOW state)
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.ANSWER_SHOW);

      const stateChangeRequest3 = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(stateChangeRequest3).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.QUESTION_COUNTDOWN);
    });
    test('NEXT_QUESTION action (Invalid) -> State === "END"', () => {
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.END);

      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(stateChangeRequest).toStrictEqual(ERROR_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.END);
    });
  });
  test('Testing END action', () => {
    // END action only has success case, it can be called while session is in any other state
    const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.END);
    expect(stateChangeRequest).toStrictEqual(SUCCESS_RESPONSE);
    // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.END);
  });
  describe('Testing GO_TO_ANSWER action', () => {
    test('GO_TO_ANSWER action (Valid)', () => {
      /*-------------------------------------
      | QUESTION_OPEN -> ANSWER_SHOW 
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      const stateChangeRequest1 = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_ANSWER);
      expect(stateChangeRequest1).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.ANSWER_SHOW);

      /*-------------------------------------
      | QUESTION_CLOSE -> ANSWER_SHOW 
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      sleepSync(1 * 1000 + LATENCY_FACTOR);
      const stateChangeRequest2 = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_ANSWER);
      expect(stateChangeRequest2).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.ANSWER_SHOW);
    });
    test('GO_TO_ANSWER action (Invalid) -> State === "END"', () => {
      /*-------------------------------------
      | END -> ANSWER_SHOW 
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.END);
      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_ANSWER);
      expect(stateChangeRequest).toStrictEqual(ERROR_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.END);
    });
  });
  describe('Testing GO_TO_FINAL_RESULTS action', () => {
    test('GO_TO_FINAL_RESULTS action (Valid)', () => {
      /*-------------------------------------
      | ANSWER_SHOW -> FINAL_RESULTS
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_ANSWER);
      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      expect(stateChangeRequest).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.FINAL_RESULTS);
    });
    test('GO_TO_FINAL_RESULTS action (Invalid) -> State === "END"', () => {
      /*-------------------------------------
      | END -> FINAL_RESULTS
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.END);
      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      expect(stateChangeRequest).toStrictEqual(ERROR_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(States.END);
    });
  });
  describe('Testing SKIP_COUNTDOWN action', () => {
    test('SKIP_COUNTDOWN action (Valid)', () => {
      /*-------------------------------------
      | QUESTION_COUNTDOWN -> QUESTION_OPEN
      ---------------------------------------*/

      quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.NEXT_QUESTION);
      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      expect(stateChangeRequest).toStrictEqual(SUCCESS_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(states.QUESTION_OPEN);
    });
    test('SKIP_COUNTDOWN action (Invalid)', () => {
      /*-------------------------------------
      | LOBBY -> QUESTION_OPEN
      ---------------------------------------*/

      const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      expect(stateChangeRequest).toStrictEqual(ERROR_RESPONSE);
      // expect(quizSessionStatusRequest(userToken, quizId, sessionId).state).toStrictEqual(states.LOBBY);
    });
  });
  test('Invalid action', () => {
    const stateChangeRequest = quizSessionStateUpdateRequest(userToken, quizId, sessionId, 'INVALID_ACTION');
    expect(stateChangeRequest).toStrictEqual(ERROR_RESPONSE);
  });
});