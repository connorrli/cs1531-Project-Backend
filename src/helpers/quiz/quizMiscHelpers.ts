/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { getData } from '../../data/dataStore';
import { Answer, AnswerReq, Player, Question, QuestionV2, Quiz, QuizSession, QuizV2 } from '../../interface';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const EMPTY = 0;
const FIRST_QUESTION_ID = 1;
const NO_DURATION = 0;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Generates an array of answer objects including colour and id.
  *
  * @param {Array} answersReqArray - Array containing all answers from body of request
  *
  * @returns {Array} - Returns array of answer objects
*/
export function generateAnswers(answersReqArray: AnswerReq[]): Answer[] {
  const answers : Answer[] = [];
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  let answerId = EMPTY;
  for (const answer of answersReqArray) {
    const randIndex = Math.floor(Math.random() * colours.length);
    answerId += 1;
    answers.push({
      answerId,
      answer: answer.answer,
      colour: colours[randIndex],
      correct: answer.correct,
    });
    colours.splice(randIndex, 1);
  }

  return answers;
}

/**
  * Generates a new question id by finding current max id and adding 1.
  *
  * @param {object} quiz - A quiz object
  *
  * @returns {number} - Returns a quiz id which is a number
*/
export function generateQuestionId(quiz: Quiz): number {
  // Determine New Question Id
  let questionId: number;
  if (quiz.questions.length === EMPTY) questionId = FIRST_QUESTION_ID;
  else {
    questionId = quiz.questions
      .reduce((max, question) => max.questionId > question.questionId ? max : question).questionId + 1;
  }

  return questionId;
}

/**
  * Finds a quiz object given its unique id.
  *
  * @param {Array} quizzes - An array containing all quizzes
  *
  * @returns {object | undefined} - Returns the quiz object if found, otherwise undefined
*/
export function findQuiz(quizzes: Quiz[], quizId: number): undefined | Quiz | QuizV2 {
  return quizzes.find(quiz => quiz.quizId === quizId);
}

export function findQuizV2(quizzes: QuizV2[], quizId: number): undefined | QuizV2 {
  return quizzes.find(quiz => quiz.quizId === quizId);
}

/**
  * Finds a quiz's index given its unique id.
  *
  * @param {Array} quizzes - An array containing all quizzes
  *
  * @returns {Object | undefined} - Returns index to quiz if found, otherwise -1
*/
export function findQuizIndex(quizzes: Quiz[], quizId: number): number {
  return quizzes.findIndex(quiz => quiz.quizId === quizId);
}

/**
  * Finds a question object given its unique id.
  *
  * @param {Array} questions - An array containing all questions within a quiz
  *
  * @returns {Object | undefined} - Returns the question if found, otherwise undefined
*/
export function findQuestion(questions: Question[], questionId: number): undefined | Question {
  return questions.find(question => question.questionId === questionId);
}

/**
  * Finds a question object given its unique id.
  *
  * @param {Array} questions - An array containing all questions within a quiz
  *
  * @returns {Object | undefined} - Returns the question if found, otherwise undefined
*/
export function findQuestionV2(questions: QuestionV2[], questionId: number): undefined | QuestionV2 {
  return questions.find(question => question.questionId === questionId);
}

/**
  * Finds a question's index given its unique id.
  *
  * @param {Array} questions - An array containing all questions within a quiz
  *
  * @returns {Object | undefined} - Returns index to question if found, otherwise -1
*/
export function findQuestionIndex(questions: Question[], questionId: number): number {
  return questions.findIndex(question => question.questionId === questionId);
}

/**
  * Updates the duration property by adding or subtracting duration to current duration.
  *
  * @param {object} quiz - The quiz object
  * @param {number} durationToAdd - Duration to add or remove from quiz
  *
  * @returns {Object | undefined} - Returns index to question if found, otherwise -1
*/
export function updateQuizDuration(quiz: Quiz) {
  let duration = NO_DURATION;
  for (const question of quiz.questions) {
    duration += question.duration;
  }
  quiz.duration = duration;
}

/**
 *
 * @param quizId - Unique ID for a quiz object
 * @param quizSessionId - Unique ID for a quiz session object
 * @returns - Located quiz session or undefined
 */
export function findQuizSession(quizId: number, quizSessionId: number): QuizSession | undefined {
  const data = getData();

  for (const session of data.sessions.quizSessions) {
    if (session.sessionId === quizSessionId && session.metadata.quizId === quizId) {
      return session;
    }
  }
  return undefined;
}

/**
 *
 * @returns
 */
export function randPlayerName (): string {
  let string: string = String.fromCharCode(Math.random() * 26 + 97);
  let newchar: string = String.fromCharCode(Math.random() * 26 + 97);
  while (string.length < 5) {
    if (string.includes(newchar)) {
      newchar = String.fromCharCode(Math.random() * 26 + 97);
    } else {
      string += newchar;
    }
  }
  let newint = Math.floor((Math.random() * 10)).toString();
  string += newint;
  while (string.length < 8) {
    if (string.includes(newint)) {
      newint = Math.floor((Math.random() * 10)).toString();
    } else {
      string += newint;
    }
  }
  return string;
}

/**
 *
 * @param answers
 * @param given
 * @returns
 */
export function answerCorrect (answers: Array<Answer>, given: Array<number>): boolean {
  for (const ans of answers) {
    if (given.includes(ans.answerId) !== ans.correct) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param players
 * @param questions
 */
export function recalculateAnswers (players: Player[], questions: number) {
  for (let questionPosition = 1; questionPosition < questions; questionPosition++) {
    players.sort((a, b) => a.playerInfo.timeTaken[questionPosition - 1] - b.playerInfo.timeTaken[questionPosition - 1]);
    let rank = 1;
    for (const pIndex in players) {
      if (players[pIndex].playerInfo.timeTaken[questionPosition - 1] !== -1 && players[pIndex].playerInfo.points[questionPosition - 1] !== 0) {
        players[pIndex].playerInfo.points[questionPosition - 1] = players[pIndex].playerInfo.points[questionPosition - 1] * 1 / (rank);
        rank++;
      }
    }
  }
}
