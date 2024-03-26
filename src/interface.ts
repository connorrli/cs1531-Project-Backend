// BELOW THIS WILL BE ALL THE UNIVERSALLY REQUIRED TYPESCRIPT INTERFACES
// ANY LOCAL-SCOPE INTERFACES SHOULD BE PLACED IN THEIR DESIGNATED FILE

/**
  * Describes the User object and all properties contained in it.
*/
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

/**
  * Describes the Quiz object and all properties contained in it.
*/
interface Quiz {
  quizId: number;
  quizOwner: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
}

/**
  * Describes the Answer object and all properties contained in it.
*/
interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

/**
  * Describes the Question object and all properties contained in it.
*/
interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

/**
  * Describes the QuestionBody object and all properties contained in it.
  *
  * This is typically an object seen within body of a question-related request.
*/
interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerReq[];
}

/**
  * Describes the AnswerReq object and all properties contained in it
  *
  * This is typically an object seen within QuestionBody-type object.
*/
interface AnswerReq {
  answer: string;
  correct: boolean;
}

/**
  * Describes the UserSession object and all properties contained in it.
  *
  * This is an object that contains a unique session token and associated user's ID.
*/
interface UserSession {
  token: string;
  userId: number;
  timeCreated: number;
}

/**
  * Describes the DataStore object, which is an object containing users, quizzes and sessions arrays.
*/
interface DataStore {
  users: User[];
  quizzes: Quiz[];
  sessions: UserSession[];
}

/**
  * Describes the TrashStore object, which is an object containing users, quizzes and sessions arrays.
  *
  * It is associated with all trash functionality, and will contain trashed quizzes.
*/
interface TrashStore {
  users: User[];
  quizzes: Quiz[];
  sessions: UserSession[];
}

/**
  * Describes the ErrorObject object, which is an object containing an error string and
  * optionally a status value.
*/
interface ErrorObject {
  error: string;
  statusValue?: number;
}

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// EXPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

export {
  ErrorObject,
  User,
  Quiz,
  Question,
  Answer,
  AnswerReq,
  DataStore,
  TrashStore,
  UserSession,
  QuestionBody,
};
