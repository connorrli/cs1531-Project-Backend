import { setData, getData } from '../dataStore';

interface generateSessionReturn { token: string }

/**
  * Given a user ID, create a session by generating a unique token
  * 
  * @param {integer} userId - Unique ID for a user
  * 
  * @returns {generateSessionReturn} - Returns an object containing token
*/
export function generateSession(userId: number): generateSessionReturn {
  const data = getData();

  const token = halfToken() + halfToken();

  data.sessions.push({
    token: token,
    userId: userId
  });
  setData(data);

  return { token: token };
}

/**
  * Generate one half of the token using pre-defined formula
  * 
  * @returns {string} halfOfToken - one half of the unique token
*/
function halfToken(): string {
  const halfOfToken = Math.floor(Math.random() * Math.floor(Math.random() * Date.now())).toString();

  return halfOfToken;
}