/**
  * Given details relating to a password change, updates the password of a logged in user.
  * 
  * @param {integer} authUserId - Stores user authentication and quiz details
  * @param {string} oldPassword - Stores the previous user password before the user changed it
  * @param {string} newPassword - Stores the new user password after the user changed it
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
    return {};
}

/**
  * Registers a user with an email, password, and names, then returns their authUserId value.
  * 
  * @param {integer} email - Stores the user email as part of the registration
  * @param {string} password - Stores the user password as part of the registration
  * @param {string} nameFirst - Stores the user's first name as part of the registration
  * @param {string} nameLast - Stores the user's second name as part of the registration
  * 
  * @returns {object} - Returns the authentication user id
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1
    };
}

/**
  * Given a registered user's email and password, returns their authUserId value.
  * 
  * @param {integer} email - Stores the user email upon login 
  * @param {integer} password - Stores the user password upon login
  * 
  * @returns {object} - Returns the authentication user id
*/
function adminAuthLogin(email, password) {
    return {
        authUserId: 1
    };
}

/**
  * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
  * 
  * @param {integer} authUserId - Stores user authentication and details about logins
  * 
  * @returns {empty object} - Returns the user id number, name, email, count of successful logins and the times where the password has been entered incorrectly
*/
function adminUserDetails (authUserId) {
    return {
      user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        }
    };
}

/**
  * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
  * 
  * @param {integer} authUserId - Stores user authentication details after updating properties
  * @param {integer} email - Stores the user email after updating their properties
  * @param {string} nameFirst - Stores the first name of the logged in user after updating properties
  * @param {string} nameLast - Stores the last name of the logged in user after updating properties
  * 
  * @returns {empty object} - Returns an empty object to the user
*/
function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
    return {};
}
