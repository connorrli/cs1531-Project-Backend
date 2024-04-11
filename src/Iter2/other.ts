/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { setData } from '../data/dataStore';
import { getTrash, setTrash } from '../data/trash';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// LOCAL INTERFACES & TYPES /////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

type EmptyObject = Record<string, never>

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Resets the state of the application back to the start.
  *
  * This function does not take in any parameters or return anything.
*/
function clear(): EmptyObject {
  setData({ users: [], quizzes: [], sessions: [] });
  return {};
}

/**
  * Flag function to check if user owns all quizzes in array.
  *
  * @param {number} userId - ID for the calling user
  * @param {Array<number>} quizIds - Array of quiz IDs
  *
  * @returns {boolean} - Returns false if any of the quizzes are not owned by the user
*/
function trashOwner(userId: number, quizIds: Array<number>): boolean {
  /* check every single quiz in quizIds and check if the userId is the owner
  of that quiz by iterating through trash.quizzes, return false as soon as a quiz
  is not owned by the user */
  const trash = getTrash();
  if (!trash) {
    return false;
  }
  for (let i = 0; i < quizIds.length; i++) {
    const quizId : number = quizIds[i];
    const quiz = trash.quizzes.find(quiz => quiz.quizId === quizId);
    if ((quiz === undefined) || (quiz.quizOwner !== userId)) {
      return false;
    }
  }
  return true;
}

/**
  * Flag function to check that all quizzes are actually in the trash
  *
  * @param {Array<number>} quizIds - Array of quiz IDs
  *
  * @returns {object} - Returns false if any quizzes are not in the trash
*/
function quizInTrash(quizIds: Array<number>): boolean {
  /* iterate through every single quiz in quizids and check if trash.quizzes
  has that quizId, as soon as a quiz is not in trash return false */
  const trash = getTrash();
  if (!trash) {
    return false;
  }
  for (let i = 0; i < quizIds.length; i++) {
    const quizId = quizIds[i];
    const isInTrash = trash.quizzes.some(quiz => quiz.quizId === quizId);
    if (isInTrash === undefined) {
      return false;
    }
  }
  return true;
}

/**
  * Function to clear specified quizzes from the trash
  *
  * @param {number} userId - ID for the calling user
  * @param {Array<number>} quizIds - Array of quiz IDs
  *
  * @returns {object} - Returns error object if any errors are found,
  *                     otherwise returns empty object
*/
function clearTrash(userId: number, quizIds: Array<number>): EmptyObject {
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

export { clear, clearTrash, trashOwner, quizInTrash };
