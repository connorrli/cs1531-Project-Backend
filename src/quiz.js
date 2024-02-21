/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * 
  * @returns {object} - Returns the quiz id number and name of the quiz
*/
function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
            quizId: 1,
            name: 'My Quiz',
            }
        ]
    }
}

/**
  * Update the description of the relevant quiz.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {};
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {integer} quizId - Displays the identification number of the current quiz
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminQuizRemove(authUserId, quizId) {
    return {};
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} name - Provides the name of the user who logged in for the quiz
  * @param {string} description - Displays the quiz questions in textual form for the user
  * 
  * @returns {object} - Returns the quiz id number of the quiz
*/
function adminQuizCreate(authUserId, name, description) {
    return {
      quizId: 2,
    }
}
