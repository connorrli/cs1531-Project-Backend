import { DataStore } from '../interface';

interface Timer {
  sessionId: number;
  timer: ReturnType<typeof setTimeout>;
  timeCreated?: number
}

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
// Our datastore definition
let data : DataStore = {
  users: [],
  quizzes: [],
  sessions: {
    userSessions: [],
    quizSessions: []
  },
};

const timers : Timer[] = [];

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  data = newData;
}

function getTimer(sessionId: number): undefined | Timer {
  return timers.find(timer => timer.sessionId === sessionId);
}

function getTimers() {
  return timers;
}

export { getData, setData, getTimer, getTimers };
