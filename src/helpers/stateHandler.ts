/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getTimer } from '../data/dataStore';
import { QuizSession, QuizV2 } from '../interface';
import HTTPError from 'http-errors';
import { save } from '../server';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

interface Timer {
  sessionId: number;
  timer: ReturnType<typeof setTimeout>;
}

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
      handleGoToFinalResults(quizSession, timer);
      break;
    case Actions.END:
      handleEnd(quizSession, timer);
      break;
    default:
      throw HTTPError(400, 'Action provided is not a valid action');
  }
}

/**
 * Handles GO_TO_FINAL_RESULTS action
 *
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleGoToFinalResults(quizSession: QuizSession, timer: Timer) {
  if (
    quizSession.state !== States.QUESTION_CLOSE &&
    quizSession.state !== States.ANSWER_SHOW
  ) {
    throw HTTPError(400, 'Cannot be applied in current state');
  }

  if (typeof timer.timer !== 'undefined') clearTimeout(timer.timer);
  quizSession.state = States.FINAL_RESULTS;
}

/**
 * Handles END action
 *
 * @param quizSession - An object for a quiz session, described in interface.ts
 * @param timer - A timer object that is linked to a quiz session, described in dataStore.ts
 */
function handleEnd(quizSession: QuizSession, timer: Timer) {
  if (typeof timer.timer !== 'undefined') clearTimeout(timer.timer);
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

  if (typeof timer.timer !== 'undefined') clearTimeout(timer.timer);

  quizSession.state = States.ANSWER_SHOW;
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

  if (typeof timer.timer !== 'undefined') clearTimeout(timer.timer);
  quizSession.state = States.QUESTION_OPEN;
  timer.timer = setTimeout(
    () => {
      quizSession.state = States.QUESTION_CLOSE;
      save();
    },
    quiz.questions[quizSession.atQuestion - 1].duration * 1000
  );
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

  if (typeof timer.timer !== 'undefined') clearTimeout(timer.timer);

  quizSession.atQuestion++;
  quizSession.state = 'QUESTION_COUNTDOWN';

  // First wait for countdown to end
  timer.timer = setTimeout(
    () => {
      quizSession.state = States.QUESTION_OPEN;
      save();
      // Then open question for specified duration
      timer.timer = setTimeout(
        () => {
          quizSession.state = States.QUESTION_CLOSE;
          save();
        },
        quiz.questions[quizSession.atQuestion - 1].duration * 1000
      );
    },
    3 * 1000
  );
}
