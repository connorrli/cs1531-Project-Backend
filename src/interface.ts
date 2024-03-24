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
  numQuestions: number;
  questions: Question[];
}

interface Answer {
  answer: string,
  correct: boolean
}

interface Question {
  questionId: number,
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
}

export interface QuestionBody {
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
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
  statusValue?: number;
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// EXPORTS /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export {
  ErrorObject,
  User,
  Quiz,
  Question,
  Answer,
  DataStore,
  TrashStore,
  UserSession,
}