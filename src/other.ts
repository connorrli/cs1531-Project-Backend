/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

type EmptyObject = Record<string, never>

import { setData } from './dataStore';

function clear(): EmptyObject {
  setData({ users: [], quizzes: [], sessions: [] });
  return {};
}

export { clear };
