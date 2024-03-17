import { setData, getData } from '../dataStore';
import { UserSession } from '../interface';

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
    userId: userId,
    timeCreated: Math.floor(Date.now() / 1000),
  });
  setData(data);

  return { token: encodeURIComponent(token) };
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

/**
  * Gets the session object associated with the given token
  * 
  * @returns {UserSession | undefined}
*/
export function getSession(token: string): UserSession | undefined {
  const data = getData();
  const decodedToken = decodeURIComponent(token);
  const session = data.sessions.find(session => session.token === decodedToken);

  return session;
}
