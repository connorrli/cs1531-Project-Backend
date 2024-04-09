/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getTimer } from "../data/dataStore";
import { QuizSession, QuizV2 } from "../interface";
import HTTPError from 'http-errors';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

type Timer = ReturnType<typeof setTimeout>;

export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
 * Function that takes in a quiz, quiz session and action, carrying out said action.
 * Results in a state change for the session. If not possible, throws HTTPError.
 * 
 * @param quiz - An object for a quiz, described in interface.ts
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param action - an action which is a string, a list can be found in Actions enum
 * 
 * @returns - Nothing
 */
export function stateMachine(quiz: QuizV2, quizSession: QuizSession, action: string) {
  // I've decided not to clear the timer until the action is verified as valid
  const timer = getTimer(quizSession.sessionId);

  switch (action) {
    case Actions.NEXT_QUESTION:
      handleNextQuestion(quiz, quizSession, timer);
      break;
    case Actions.SKIP_COUNTDOWN:
      handleSkipCountdown(quiz, quizSession, timer);
      break;
    case Actions.GO_TO_ANSWER:
      handleGoToAnswer(quizSession, timer);
      break;
    case Actions.GO_TO_FINAL_RESULTS:
      clearTimeout(timer);
      break;
    case Actions.END:
      handleEnd(quizSession, timer);
      break;
    default:
      throw HTTPError(400, 'Action provided is not a valid action');
  }

  return;
}

/**
 * Handles END action
 * 
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleEnd(quizSession: QuizSession, timer: Timer) {
  clearTimeout(timer);
  quizSession.state = States.END;
}

/**
 * Handles GO_TO_ANSWER action
 * 
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleGoToAnswer(quizSession: QuizSession, timer: Timer) {
  if (
    quizSession.state !== States.QUESTION_OPEN &&
    quizSession.state !== States.QUESTION_CLOSE
  ) {
    throw HTTPError(400, 'Cannot be applied in current state');
  }

  clearTimeout(timer);
  quizSession.state = States.ANSWER_SHOW;

  return;
}

/**
 * Handles SKIP_COUNTDOWN action
 * 
 * @param quiz - An object for a quiz, described in interface.ts
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleSkipCountdown(
  quiz: QuizV2,
  quizSession: QuizSession,
  timer: Timer
) {
  if (quizSession.state !== States.QUESTION_COUNTDOWN) {
    throw HTTPError(400, 'Cannot be applied in current state');
  }

  clearTimeout(timer);
  quizSession.state = States.QUESTION_OPEN;
  setTimeout(
    () => {
      quizSession.state = States.QUESTION_CLOSE;
    },
    quiz.questions[quizSession.atQuestion - 1].duration * 1000
  );

  return;
}

/**
 * Handles NEXT_QUESTION action
 * 
 * @param quiz - An object for a quiz, described in interface.ts
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleNextQuestion(
  quiz: QuizV2, 
  quizSession: QuizSession, 
  timer: Timer
) {
  if (
    quizSession.state !== States.QUESTION_CLOSE &&
    quizSession.state !== States.ANSWER_SHOW &&
    quizSession.state !== States.LOBBY
  ) {
    throw HTTPError(400, 'Cannot be applied in current state');
  }

  clearTimeout(timer);

  if (quizSession.atQuestion === quiz.numQuestions) {
    stateMachine(quiz, quizSession, Actions.GO_TO_FINAL_RESULTS);
    return;
  }

  quizSession.atQuestion++;
  quizSession.state = 'QUESTION_COUNTDOWN';

  // First wait for countdown to end
  setTimeout(
    () => {
      quizSession.state = States.QUESTION_OPEN;
      // Then open question for specified duration
      setTimeout(
        () => {
          quizSession.state = States.QUESTION_CLOSE;
        },
        quiz.questions[quizSession.atQuestion - 1].duration * 1000
      );
    },
    3 * 1000
  );

  return;
}