// BELOW THIS WILL BE ALL THE UNIVERSALLY REQUIRED TYPESCRIPT INTERFACES
// ANY LOCAL-SCOPE INTERFACES SHOULD BE PLACED IN THEIR DESIGNATED FILE

// Interface describing a user object
interface User {
  userId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  previousPasswords: string[];
  numFailedPasswordsSinceLastLogin: number;
}

// Interface describing a quiz object
interface Quiz {
  quizId: number;
  quizOwner: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

// Interface describing a session object
interface UserSession {
  token: string;
  userId: number;
  timeCreated: number;
}

// Interface describing the dataStore object
interface DataStore {
  users: User[];
  quizzes: Quiz[];
  sessions: UserSession[];
}

// Interface describing the trashStore object
interface TrashStore {
  users: User[];
  quizzes: Quiz[];
  sessions: UserSession[];
}

// Interface describing an error object
interface ErrorObject {
  error: string;
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
  ErrorObject,
  User,
  Quiz,
  DataStore,
  TrashStore,
  UserSession,
}