import { getData } from '../dataStore.js';

function isValidUser(authUserId) {
  if (getData().users.length === 0) {
    return false;
  }
  const user = getData().users.find(u => u.userId === authUserId);
  return !!user;
}

function isValidQuiz(quizId) {
  if (getData().quizzes.length === 0) {
    return false;
  }
  const quiz = getData().quizzes.find(q => q.quizId === quizId);
  return !!quiz;
}

export { isValidUser, isValidQuiz };