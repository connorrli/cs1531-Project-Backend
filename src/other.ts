/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

type EmptyObject = Record<string, never>

import { setData } from './dataStore';
import { getTrash, setTrash } from './trash';
import { ErrorObject } from './interface';

function clear(): EmptyObject {
  setData({ users: [], quizzes: [], sessions: [] });
  return {};
}

function trashOwner(userId: number, quizIds: Array<number>): boolean {
  /* check every single quiz in quizIds and check if the userId is the owner of that quiz by iterating through trash.quizzes, 
  return false as soon as a quiz is not owned by the user */
  return true;
}

function quizInTrash(quizIds: Array<number>): boolean {
  /* iterate through every single quiz in quizids and check if trash.quizzes has that quizId, as soon as a quiz is not in trash 
  return false */
  return true;
}

function clearTrash(userId: number, quizIds: Array<number>): EmptyObject | ErrorObject {

  const trash = getTrash();

  for (let quizIndex = 0; quizIndex < trash.quizzes.length; quizIndex++) {
    if (trash.quizzes[quizIndex].quizOwner === userId && quizIds.includes((trash.quizzes[quizIndex].quizId))) {
      trash.quizzes.splice(quizIndex, 1);
      quizIndex--;
    }
  }
  
  setTrash(trash);
  return {};
}

export { clear, clearTrash, trashOwner, quizInTrash};
