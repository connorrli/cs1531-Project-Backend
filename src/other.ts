/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

interface ClearReturn { }

import { getData, setData } from './dataStore';
import { getTrash, setTrash } from './trash';


function clear(): ClearReturn {
  setData({ users: [], quizzes: [], sessions: [] });
  return {};
}

/* function clearTrash(userId: number, token: string, quizIds: string): ClearReturn {
  const trash = getTrash();
  for (let quizIndex in trash.quizzes) {
    if (trash.quizzes[quizIndex].quizOwner === userId && quizIds.includes(trash.quizzes[quizIndex].userId)) {
      trash.quizzes.splice(quizIndex, 1);
    }
  }
  setTrash(trash);
} */

function clearTrash(userId: number, token: string, quizIds: string): void {

  const trash = getTrash();

  for (let quizIndex = 0; quizIndex < trash.quizzes.length; quizIndex++) {
    if (trash.quizzes[quizIndex].quizOwner === userId && quizIds.includes(String(trash.quizzes[quizIndex].quizId))) {
      trash.quizzes.splice(quizIndex, 1);
      quizIndex--;
    }
  }
  
  setTrash(trash);
}

export { clear, clearTrash};
