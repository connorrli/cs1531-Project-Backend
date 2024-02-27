/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

import { getData, setData } from './dataStore.js';

function clear() {
  setData({ users: [], quizzes: [] });
  return {};
}

export {clear};
