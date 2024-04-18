import { TrashStore } from '../interface';
import { requestHelper } from './dataStore';

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
  try {
    const res = requestHelper('GET', '/trashdata', {});
    return res.trashData;
  } catch (e) {
    return {
      users: [],
      quizzes: [],
      sessions: [],
    };
  }
};

/**
  * Sets the trash object with new data
  *
*/
const setTrash = (newData: TrashStore) => {
  requestHelper('PUT', '/trashdata', { trashData: newData });
};

export { getTrash, setTrash };
