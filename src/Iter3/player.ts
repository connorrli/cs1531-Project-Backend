import { getData } from '../data/dataStore';
import HTTPError from 'http-errors';
import { halfToken } from '../helpers/sessionHandler';

export function adminPlayerJoin(name: string, sessionId: number) {
  if (name.length === 0) {
    name = randPlayerName();
  }
  const data = getData();
  const quizSession = data.sessions.quizSessions.find(q => q.sessionId === sessionId);
  if (quizSession === undefined) {
    throw HTTPError(400, 'ERROR 400: Session ID is not a valid session');
  }
  if (quizSession.state !== 'LOBBY') {
    throw HTTPError(400, 'ERROR 400: Session is not in a lobby state');
  }
  const nameExists = quizSession.players.find(p => p.name === name);
  if (nameExists !== undefined) {
    throw HTTPError(400, 'ERROR 400: Name already in use!');
  }
  const pseudorandId = parseInt(halfToken());
  const quiz = data.quizzes.find(q => q.quizId === quizSession.metadata.quizId);
  const player = {
    playerId: pseudorandId,
    name: name,
    playerInfo: {
      points: Array(quiz.questions.length).fill(0),
      timeTaken: Array(quiz.questions.length).fill(-1)
    }
  };
  quizSession.players.push(player);

  return { playerId: player.playerId };
}

export function adminPlayerQuestionInfo (playerId: number, questionPosition: number) {
  const data = getData();
  let quiz;
  for (const session of data.sessions.quizSessions) {
    if (session.players.find(p => p.playerId === playerId) !== undefined) {
      quiz = session;
    }
  }
  if (quiz === undefined) {
    throw HTTPError(400, 'ERROR 400: Could not find player ID');
  }
  if (quiz.atQuestion !== questionPosition) {
    throw HTTPError(400, `ERROR 400: Quiz either not at question ${questionPosition}, or ${questionPosition} is not a valid question position for this quiz.`);
  }
  if (quiz.state === 'LOBBY' || quiz.state === 'QUESTION_COUNTDOWN' || quiz.state === 'END') {
    throw HTTPError(400, 'ERROR 400: Quiz in wrong state');
  }
  const quizId = quiz.metadata.quizId;
  const quizData = data.quizzes.find(q => q.quizId === quizId);
  if (quizData === undefined) {
    throw HTTPError(400, 'bruh');
  }
  const question = { ...quizData.questions[questionPosition - 1] };
  for (const answer of question.answers) {
    delete answer.correct;
  }
  return question;
}

export function adminPlayerSubmit (answerIds: Array<number>, playerId: number, questionPosition: number) {
  return {};
}

function randPlayerName (): string {
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
