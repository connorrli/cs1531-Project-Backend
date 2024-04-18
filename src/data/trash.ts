import { TrashStore } from '../interface';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let trash : TrashStore = {
  users: [],
  quizzes: [],
  sessions: [],
};

/**
  * Fetches the trash object containing trashed items
  *
*/
const getTrash = (): TrashStore => {
  return trash;
};

/**
  * Sets the trash object with new data
  *
*/
const setTrash = (newData: TrashStore) => {
  trash = newData;
};

export { getTrash, setTrash };
