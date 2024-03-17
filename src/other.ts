/**
  * Resets the state of the application back to the start. This function does not take in any parameters or return anything.
*/

interface ClearReturn { }

import { getData, setData } from './dataStore';

function clear(): ClearReturn {
  setData({ users: [], quizzes: [] });
  return {};
}

export { clear };
