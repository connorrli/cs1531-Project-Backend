import { DataStore } from '../interface';
import HTTPError from 'http-errors';
import request, { HttpVerb } from 'sync-request';
import { DEPLOYED_URL } from '../submission';


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

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let json = {};
  let qs = {};
  if (['POST', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  const res = request(method, DEPLOYED_URL + path, { qs, json, timeout: 20000 });
  return JSON.parse(res.body.toString());
};

const getData = (): DataStore => {
  try {
    const res = requestHelper('GET', '/data', {});
    return res.data;
  } catch (e) {
    return {
      users: [],
      quizzes: [],
      sessions: {
        userSessions: [],
        quizSessions: []
      },
    };
  }
};

const setData = (newData: DataStore) => {
  requestHelper('PUT', '/data', { data: newData });
};


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

function getTimer(sessionId: number): undefined | Timer {
  return timers.find(timer => timer.sessionId === sessionId);
}

function getTimers() {
  return timers;
}

export { requestHelper, getData, setData, getTimer, getTimers };
