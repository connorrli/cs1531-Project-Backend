import { TrashStore } from './interface';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let trash : TrashStore = {
  users: [],
  quizzes: [],
  sessions: [],
};

/**
  * Fetches the trash object containing trashed items
  *
  * @returns {object} - Returns a trash object
*/
function getTrash() {
  return trash;
}

/**
  * Sets the trash object with new data
  *
  * @param {object} newTrash - New trash object
*/
function setTrash(newTrash: TrashStore) {
  trash = newTrash;
}

export { getTrash, setTrash };
