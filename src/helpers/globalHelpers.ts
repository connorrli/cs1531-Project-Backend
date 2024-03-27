/* ----------------------------------------------------------------------------------
| GLOBAL HELPERS
|   - CONTAINS SMALL HELPER FUNCTIONS THAT ARE USED GLOBALLY
|   - ANY HELPER FUNCTIONS THAT ARE USED ONLY IN A SPECIFIC FILE (quiz, auth, other)
|     SHOULD BE PLACED IN THEIR LOCAL HELPERS FILE (e.g. quizMiscHelpers.ts)
------------------------------------------------------------------------------------ */

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import { User } from '../interface';

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// CONSTANTS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

const MILLISECONDS_IN_SECOND = 1000;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////// FUNCTIONS ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/**
  * Get current time using Math.floor(Date.now() / 1000)
  *
  * @returns {number} - Returns the current time as number of seconds since epoch
*/
export function getCurrentTime(): number {
  return Math.floor(Date.now() / MILLISECONDS_IN_SECOND);
}

/**
  * Finds a user object given its unique id
  *
  * @param {Array} users - An array containing all users
  *
  * @returns {object | undefined} - Returns the user object if found, otherwise undefined
*/
export function findUser(users: User[], userId: number): undefined | User {
  return users.find(user => user.userId === userId);
}
