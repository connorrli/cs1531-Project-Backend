import { TrashStore } from './interface';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let trash : TrashStore = {
  users: [],
  quizzes: [],
  sessions: [],
};

// Use get() to access the trash
function getTrash() {
  return trash;
}

// Use set(newTrash) to pass in the entire trash object, with modifications made
function setTrash(newTrash: TrashStore) {
  trash = newTrash;
}

export { getTrash, setTrash };
