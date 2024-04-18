import request, { HttpVerb } from "sync-request";
import { DEPLOYED_URL } from "../submission";
import { getData, setData } from "./dataStore";
import { getTrash, setTrash } from "./trash";

// Loads the trashbase.json file and sets the trash into trashStore if it exists
export const loadTrash = () => {
  try {
    const res = requestHelper('GET', '/trashdata', {});
    setTrash(res.trashData);
  } catch (e) {
    setTrash({
      users: [],
      quizzes: [],
      sessions: [],
    });
  }
};

// Loads the database.json file and sets the data into dataStore if it exists
export const load = () => {
  try {
    const res = requestHelper('GET', '/data', {});
    setData(res.data);

    return;
  } catch (e) {
    setData({
      users: [],
      quizzes: [],
      sessions: {
        userSessions: [],
        quizSessions: [],
      }
    });
  }
};

export const requestHelper = (method: HttpVerb, path: string, payload: object) => {
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

// Save current `trash` trashStore object state into trashbase.json
export const saveTrash = () => {
  requestHelper('PUT', '/trashdata', { trashData: getTrash() });
};

// Save current `data` dataStore object state into database.json
export const save = () => {
  requestHelper('PUT', '/data', { data: getData() });
};
