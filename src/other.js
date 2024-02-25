/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

import { getData, setData } from './datastore.js';

function clear() {
  setData({ users: [], quizzes: [] });
  return {};
}
