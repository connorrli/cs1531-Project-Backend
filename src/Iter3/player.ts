import { getData, getTimer } from '../data/dataStore';
import HTTPError from 'http-errors';
import { halfToken } from '../helpers/sessionHandler';
import { Answer, Player, QuizSession } from '../interface';

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
  const answersReturn = [];
  for (const obj of question.answers) {
    answersReturn.push({ answerId: obj.answerId, answer: obj.answer, colour: obj.colour });
  }
  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: answersReturn
  };
}

export function adminPlayerSubmit (answerIds: Array<number>, playerId: number, questionPosition: number) {
  const data = getData();
  let sess: QuizSession;
  for (const session of data.sessions.quizSessions) {
    if (session.players.find(p => p.playerId === playerId) !== undefined) {
      sess = session;
    }
  }
  if (sess === undefined) {
    throw HTTPError(400, 'ERROR 400: player does not exist');
  }
  if (sess.atQuestion !== questionPosition) {
    throw HTTPError(400, `ERROR 400: Quiz either not at position ${questionPosition}, or ${questionPosition} is not a valid question position for this quiz`);
  }
  if (sess.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, 'ERROR 400: Quiz not in QUESTION_OPEN state');
  }
  const quiz = data.quizzes.find(q => q.quizId === sess.metadata.quizId);
  if (quiz === undefined) {
    throw HTTPError(400, 'what');
  }

  if (!(answerIds.length > 0)) {
    throw HTTPError(400, 'ERROR 400: Need to submit at least one answer');
  }

  const checkedAns: Array<number> = [];
  const validAns: Array<number> = [];
  for (const ans of answerIds) {
    for (const ansObj of quiz.questions[questionPosition - 1].answers) {
      validAns.push(ansObj.answerId);
    }
    if (!(validAns.includes(ans))) {
      throw HTTPError(400, 'ERROR 400: Answer ID does not exist in this question');
    }
    if (checkedAns.includes(ans)) {
      throw HTTPError(400, 'ERROR 400: Duplicate answer ID(s)!');
    }
    checkedAns.push(ans);
  }

  const timer = getTimer(sess.sessionId);
  if (timer.timeCreated === undefined) {
    throw HTTPError(500, 'i give up');
  }

  const timeTaken = Date.now() - timer.timeCreated;
  const player = sess.players.find(p => p.playerId === playerId);
  player.playerInfo.timeTaken[questionPosition - 1] = timeTaken;

  if (answerCorrect(quiz.questions[questionPosition - 1].answers, answerIds)) {
    player.playerInfo.points[questionPosition - 1] = quiz.questions[questionPosition - 1].points;
  } else {
    player.playerInfo.points[questionPosition - 1] = 0;
  }

  return {};
}

export function adminPlayerQuestionResults (playerId: number, questionPosition: number) {
  const data = getData();
  let sess: QuizSession;
  for (const session of data.sessions.quizSessions) {
    if (session.players.find(p => p.playerId === playerId) !== undefined) {
      sess = session;
    }
  }
  if (sess === undefined) {
    throw HTTPError(400, 'ERROR 400: PlayerId is not a valid playerId');
  }
  if (sess.state !== 'ANSWER_SHOW') {
    throw HTTPError(400, 'ERROR 400: Quiz session in wrong state');
  }
  if (sess.atQuestion !== questionPosition) {
    throw HTTPError(400, `ERROR 400: Either ${questionPosition} is not a valid question position for this quiz, or quiz is not at question ${questionPosition}`);
  }

  return answerResults(sess.sessionId, questionPosition);
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

function answerCorrect (answers: Array<Answer>, given: Array<number>): boolean {
  for (const ans of answers) {
    if (given.includes(ans.answerId) !== ans.correct) {
      return false;
    }
  }
  return true;
}

export function recalculateAnswers (players: Player[], questions: number) {
  for (let questionPosition = 1; questionPosition < questions; questionPosition++) {
    players.sort((a, b) => a.playerInfo.timeTaken[questionPosition - 1] - b.playerInfo.timeTaken[questionPosition - 1]);
    for (const pIndex in players) {
      if (players[pIndex].playerInfo.timeTaken[questionPosition - 1] !== -1) {
        players[pIndex].playerInfo.points[questionPosition - 1] = players[pIndex].playerInfo.points[questionPosition - 1] * 1 / (parseInt(pIndex) + 1);
      }
    }
  }
}

export function answerResults (sessionId: number, questionPosition: number) {
  const data = getData();
  const sess = data.sessions.quizSessions.find(s => s.sessionId === sessionId);
  if (sess === undefined) {
    throw HTTPError(400, 'Invalid session parsed!');
  }
  const quiz = data.quizzes.find(q => q.quizId === sess.metadata.quizId);
  let netTime = 0;
  const playersCorrectList: Array<string> = [];
  for (const player of sess.players) {
    if (player.playerInfo.timeTaken[questionPosition - 1] !== -1) {
      netTime += player.playerInfo.timeTaken[questionPosition - 1];
    }
    if (player.playerInfo.points[questionPosition - 1] !== 0) {
      playersCorrectList.push(player.name);
    }
  }
  return {
    questionId: quiz.questions[questionPosition - 1].questionId,
    playersCorrectList,
    averageAnswerTime: Math.floor((netTime / 1000) / sess.players.length),
    percentCorrect: Math.floor(playersCorrectList.length * 100 / sess.players.length)
  };
}
