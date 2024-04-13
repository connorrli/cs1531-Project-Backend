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
  const player = {
    playerId: pseudorandId,
    name: name
  };
  quizSession.players.push(player);

  return { playerId: player.playerId };
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
