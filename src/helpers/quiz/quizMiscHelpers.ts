import { Answer, AnswerReq, Question, Quiz } from "../../interface";
const EMPTY = 0;
const FIRST_QUESTION_ID = 1;

/**
  * Generates an array of answer objects including colour and id
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
  * Generates a new question id by finding current max id and adding 1
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
  * Get current time using Math.floor(Date.now() / 1000)
  *
  * @returns {number} - Returns the current time as number of seconds since epoch
*/
export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
  * Finds a quiz object given its unique id
  *
  * @param {Array} quizzes - An array containing all quizzes
  *
  * @returns {object | undefined} - Returns the quiz object if found, otherwise undefined
*/
export function findQuiz(quizzes: Quiz[], quizId: number): undefined | Quiz {
  return quizzes.find(quiz => quiz.quizId === quizId);
}

/**
  * Finds a question object give its unique id
  *
  * @param {Array} questions - An array containing all questions within a quiz
  *
  * @returns {Object | undefined} - Returns the question if found, otherwise undefined
*/
export function findQuestion(questions: Question[], questionId: number): undefined | Question {
  return questions.find(question => question.questionId === questionId); 
}