// Import statements of various packages/libraries that we will leverage for the project
import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import HTTPError from 'http-errors';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { setData, getData } from './data/dataStore';
import { getSession, getSessionV2 } from './helpers/sessionHandler';
import {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminUserDetailsUpdate,
  adminAuthLogout
} from './Iter2/auth';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizRemove,
  adminQuizTrashView,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizTransfer,
  adminQuizQuestionDelete,
  adminQuizRestore,
  adminQuizQuestionMove,
  adminQuizQuestionDuplicate
} from './Iter2/quiz';

import { AdminQuizListReturn } from './Iter2/quiz';
import { ErrorObject, UserSession } from './interface';
import { getTrash, setTrash } from './data/trash';
import { clear, clearTrash, trashOwner, quizInTrash } from './Iter2/other';
import {
  adminQuizCreateV2,
  adminQuizDescriptionUpdateV2,
  adminQuizInfoV2,
  adminQuizListV2,
  adminQuizNameUpdateV2,
  adminQuizQuestionCreateV2,
  adminQuizQuestionDeleteV2,
  adminQuizQuestionDuplicateV2,
  adminQuizQuestionMoveV2,
  adminQuizQuestionUpdateV2,
  adminQuizRemoveV2,
  adminQuizRestoreV2,
  adminQuizSessionStateUpdate,
  adminQuizThumbnailUpdate,
  adminQuizSessionStart,
  adminQuizTransferV2,
  guestPlayerStatus,
  allChatMessages,
  sendChatMessage,
  adminQuizSessionStatus,
  adminQuizSessions,
  adminQuizSessionResults,
  adminQuizSessionResultsCsv
} from './Iter3/quizV2';
import {
  adminAuthLogoutV2,
  adminUserDetailsUpdateV2,
  adminUserDetailsV2,
  adminUserPasswordUpdateV2
} from './Iter3/authV2';
import {
  adminPlayerJoin,
  adminPlayerQuestionInfo,
  adminPlayerQuestionResults,
  adminPlayerSubmit,
  adminQuizPlayerResults
} from './Iter3/player';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////// DATA FUNCTIONS //////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// Loads the database.json file and sets the data into dataStore if it exists
const load = () => {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json', { encoding: 'utf8' });
    setData(JSON.parse(file));
  }
};
load();

// Loads the trashbase.json file and sets the trash into trashStore if it exists
const loadTrash = () => {
  if (fs.existsSync('./trashbase.json')) {
    const file = fs.readFileSync('./trashbase.json', { encoding: 'utf8' });
    setTrash(JSON.parse(file));
  }
};
loadTrash();

// Save current `data` dataStore object state into database.json
export const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(getData(), null, 2));
};

// Save current `trash` trashStore object state into trashbase.json
const saveTrash = () => {
  fs.writeFileSync('./trashbase.json', JSON.stringify(getTrash(), null, 2));
};

/// ////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////// ITERATION 2 ROUTES ////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// quizTrashView GET request route
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  const session: UserSession | ErrorObject = getSession(token);
  if ('error' in session) return res.status(401).json({ error: 'Token is invalid or empty' });
  const quizzes = adminQuizTrashView(session.userId);
  return res.json(quizzes);
});

// adminAuthRegister POST request route
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  const email = req.body.email as string;
  const pass = req.body.password as string;

  const response = adminAuthRegister(email, pass, nameFirst, nameLast);
  if ('error' in response) return res.status(400).json(response);

  save();
  return res.json(response);
});

// adminAuthLogin POST request route
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const email = req.body.email as string;
  const pass = req.body.password as string;

  const response = adminAuthLogin(email, pass);
  if ('error' in response) { return res.status(400).json(response); }

  save();
  return res.json(response);
});

// adminAuthLogOut POST request route
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminAuthLogout(session);

  if ('error' in response) {
    return res.status(401).json(response);
  }
  save();
  res.status(200);
  return res.json(response);
});

// adminUserDetails GET request route
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  return res.json(adminUserDetails(session.userId));
});

// adminUserDetailsUpdate PUT request route
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminUserDetailsUpdate(session, email, nameFirst, nameLast);
  if ('error' in response) return res.status(400).json(response);

  save();
  return res.json(response);
});

// adminUserPasswordUpdate PUT request route
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminUserPasswordUpdate(session, oldPassword, newPassword);
  if ('error' in response) return res.status(400).json(response);

  save();
  return res.json(response);
});

// quizCreate POST request route
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token: string = req.body.token;
  const session: UserSession | ErrorObject = getSession(token);
  if ('error' in session) {
    return res.status(401).json({ error: 'Token is invalid.' });
  }
  const name: string = req.body.name;
  const description: string = req.body.description;
  const response: { quizId: number } | ErrorObject = adminQuizCreate(session.userId, name, description);
  if ('error' in response) { res.status(400); } else { res.status(200); }
  save();
  return res.json(response);
});

// quizList GET request route
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const query = req.query;
  const token = query.token as string;
  const session = getSession(token);
  let response: AdminQuizListReturn | ErrorObject;

  if (('error' in session)) {
    return res.status(401).json({ error: 'Token is invalid or empty' });
  } else {
    response = adminQuizList(session.userId);
  }
  res.status(200);
  return res.json(response);
});

// Example GET request route
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// clear DELETE request route
app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  save();
  setTrash({ users: [], quizzes: [], sessions: [] });
  saveTrash();
  res.json(response);
});

// quizRestore POST request route
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token: string = req.body.token.toString();
  const quizId: number = parseInt(req.params.quizid.toString());
  const session = getSession(token);
  if ('error' in session) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const response = adminQuizRestore(session.userId, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json({ error: response.error });
  }
  save();
  res.status(200);
  return res.json(response);
});

// quizSendToTrash DELETE request route
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid);
  const token: string = req.query.token.toString();
  const session: UserSession | ErrorObject = getSession(token);
  if ('error' in session) {
    return res.status(401).json({ error: 'Token is invalid' });
  }
  const response = adminQuizRemove(session.userId, quizId);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    return res.status(400).json(response);
  }

  saveTrash();
  save();
  return res.json(response);
});

// adminQuizInfo GET request route
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const session = getSession(token);
  if ('error' in session) {
    return res.status(401).json(session);
  }
  const userId = session.userId;
  const response = adminQuizInfo(userId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }

  return res.json(response);
});

// adminQuizNameUpdate PUT request route
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid);
  const name: string = req.body.name;
  const token: string = req.body.token;
  const session: UserSession | ErrorObject = getSession(token);
  if ('error' in session) {
    return res.status(401).json(session);
  }

  const userId: number = session.userId;
  const response: ErrorObject | Record<string, never> = adminQuizNameUpdate(userId, quizId, name);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    return res.status(400).json(response);
  }

  save();
  return res.json(response);
});

// adminQuizDescriptionUpdate PUT request route
app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizid: number = parseInt(req.params.quizId);
  const token: string = req.body.token;
  const desc: string = req.body.description;
  const session: UserSession | ErrorObject = getSession(token);
  if ('error' in session) {
    return res.status(401).json(session);
  }
  const userId: number = session.userId;
  const response: ErrorObject | Record<string, never> = adminQuizDescriptionUpdate(userId, quizid, desc);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    return res.status(400).json(response);
  }

  save();
  return res.json(response);
});

// adminQuizQuestionCreate POST request route
app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, questionBody } = req.body;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminQuizQuestionCreate(session.userId, quizId, questionBody);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    else return res.status(400).json(response);
  }

  save();
  res.json(response);
});
// adminQuizQuestionMove PUT req
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid);
  const questionId: number = parseInt(req.params.questionid);
  const { token, newPosition } = req.body as { token: string, newPosition: number };
  const session: UserSession | ErrorObject = getSession(token);

  if ('error' in session) {
    return res.status(401).json(session);
  }

  const response = adminQuizQuestionMove(session.userId, quizId, questionId, newPosition);

  if ('error' in response) {
    return res.status(response.statusCode).json({ error: response.error });
  }

  save();
  return res.json(response);
});

// adminQuizQuestionUpdate PUT request route
app.put('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);

  const { token, questionBody } = req.body;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminQuizQuestionUpdate(session.userId, quizId, questionId, questionBody);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    else return res.status(400).json(response);
  }

  save();
  res.json(response);
});

// adminQuizQuestionDelete DELETE request route
app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  const quizId: number = parseInt(req.params.quizId);
  const questionId: number = parseInt(req.params.questionId);
  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);

  const response = adminQuizQuestionDelete(session.userId, quizId, questionId);

  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    return res.status(400).json(response);
  }

  save();
  return res.status(200).json(response);
});

// adminQuizQuestionDuplicate POST request route
app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizId);
  const questionId: number = parseInt(req.params.questionId);
  const token: string = req.body.token;

  const session = getSession(token);
  if ('error' in session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const response = adminQuizQuestionDuplicate(session.userId, quizId, questionId);
  if ('error' in response) {
    if ('statusValue' in response) return res.status(response.statusValue).json({ error: response.error });
    return res.status(400).json(response);
  }

  save();
  return res.json(response);
});

// admim
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIds: Array<number> = JSON.parse(req.query.quizIds.toString());
  const token: string = req.query.token.toString();
  const session = getSession(token);

  if ('error' in session) {
    return res.status(401).json(session);
  }

  if (!quizInTrash(quizIds)) {
    return res.status(400).json({ error: 'At least one of the quizzes is not in trash' });
  }

  if (!trashOwner(session.userId, quizIds)) {
    return res.status(403).json({ error: 'One or more of the quiz Ids refer to a quiz that the user does not own' });
  }

  const response = clearTrash(session.userId, quizIds);
  saveTrash();
  save();
  return res.json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;
  const session = getSession(token);

  if ('error' in session) return res.status(401).json(session);

  const response = adminQuizTransfer(quizId, session.userId, userEmail);
  if ('error' in response) {
    if ('statusValue' in response) {
      return res.status(response.statusValue).json({ error: response.error });
    }
    return res.status(400).json({ error: response.error });
  }
  save();
  return res.json(response);
});

/// ////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////// ITERATION 3 ROUTES ////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

// adminAuthLogOutV2 POST request route
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminAuthLogoutV2(session);

  save();
  return res.json(response);
});

// adminUserDetailsV2 GET request route
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminUserDetailsV2(session.userId);

  return res.json(response);
});

// adminUserDetailsUpdateV2 PUT request route
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.header('token');

  const session = getSessionV2(token);

  const response = adminUserDetailsUpdateV2(session, email, nameFirst, nameLast);

  save();
  return res.json(response);
});

// adminUserPasswordUpdateV2 PUT request route
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.header('token');

  const session = getSessionV2(token);

  const response = adminUserPasswordUpdateV2(session, oldPassword, newPassword);

  save();
  return res.json(response);
});

// quizListV2 GET request route
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminQuizListV2(session.userId);

  return res.json(response);
});

// quizCreateV2 POST request route
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const session = getSessionV2(token);
  const { name, description } = req.body;

  const response = adminQuizCreateV2(session.userId, name, description);

  save();
  return res.json(response);
});

// quizTrashViewV2 GET request route
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token');
  const session = getSessionV2(token);

  // This had no differences to old, so can keep using it.
  const quizzes = adminQuizTrashView(session.userId);
  return res.json(quizzes);
});

// quizTrashEmptyV2 DELETE request route
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIds: Array<number> = JSON.parse(req.query.quizIds.toString());
  const token = req.header('token');
  const session = getSessionV2(token);

  // I think this may be wrong but checking owner prop first is annoying
  if (!quizInTrash(quizIds)) {
    throw HTTPError(400, 'ERROR 400: At least one quiz isn\'t in trash');
  }
  if (!trashOwner(session.userId, quizIds)) {
    throw HTTPError(403, 'ERROR 403: One or more of quiz IDs refer to an unowned quiz');
  }

  // This function also still works for iteration 3
  const response = clearTrash(session.userId, quizIds);

  saveTrash();
  save();
  return res.json(response);
});

// quizRemoveV2 DELETE request route
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminQuizRemoveV2(session.userId, quizId);

  saveTrash();
  save();
  return res.json(response);
});

// quizRestoreV2 POST request route
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid.toString());
  const session = getSessionV2(token);

  const response = adminQuizRestoreV2(session, quizId);

  save();
  return res.json(response);
});

// quizTransferV2 POST request route
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const userEmail = req.body.userEmail;

  const session = getSessionV2(token);

  const response = adminQuizTransferV2(quizId, session.userId, userEmail);

  save();
  return res.json(response);
});

app.post('/v2/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.header('token');
  const questionBody = req.body.questionBody;

  const session = getSessionV2(token);

  const response = adminQuizQuestionCreateV2(session.userId, quizId, questionBody);

  save();
  return res.json(response);
});

// adminQuizInfoV2 GET request route
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminQuizInfoV2(session.userId, quizId);

  return res.json(response);
});

// adminQuizQuestionDeleteV2 DELETE request route
app.delete('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const session = getSessionV2(token);

  const response = adminQuizQuestionDeleteV2(session.userId, quizId, questionId);

  save();
  return res.json(response);
});

// adminQuizNameUpdateV2 PUT request route
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;
  const token = req.header('token');

  const session = getSessionV2(token);

  const response = adminQuizNameUpdateV2(session.userId, quizId, name);

  save();
  return res.json(response);
});

// adminQuizDescriptionUpdateV2 PUT request route
app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizId);
  const token = req.header('token');
  const description = req.body.description;

  const session = getSessionV2(token);

  const response = adminQuizDescriptionUpdateV2(session.userId, quizid, description);

  save();
  return res.json(response);
});

// adminQuizQuestionUpdateV2 PUT request route
app.put('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const questionBody = req.body.questionBody;
  const token = req.header('token');

  const session = getSessionV2(token);

  const response = adminQuizQuestionUpdateV2(session.userId, quizId, questionId, questionBody);

  save();
  res.json(response);
});

// adminQuizQuestionMoveV2 PUT request route
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const newPosition = req.body.newPosition;
  const token = req.header('token');
  const session = getSessionV2(token);

  const response = adminQuizQuestionMoveV2(session.userId, quizId, questionId, newPosition);

  save();
  return res.json(response);
});

// adminQuizQuestionDuplicate POST request route
app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const token = req.header('token');

  const session = getSessionV2(token);

  const response = adminQuizQuestionDuplicateV2(session.userId, quizId, questionId);

  save();
  return res.json(response);
});

app.put('/v1/admin/quiz/:quizId/session/:sessionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const sessionId = parseInt(req.params.sessionId);
  const token = req.header('token');
  const action = req.body.action;

  const session = getSessionV2(token);

  const response = adminQuizSessionStateUpdate(session.userId, quizId, sessionId, action);
  save();
  return res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { name, sessionId } = req.body as { name: string, sessionId: number };
  const response = adminPlayerJoin(name, sessionId);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerId/question/:questionPosition/results', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerId);
  const questionPosition: number = parseInt(req.params.questionPosition);
  const response = adminPlayerQuestionResults(playerId, questionPosition);
  return res.json(response);
});

app.put('/v1/player/:playerId/question/:questionPosition/answer', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerId);
  const questionPosition: number = parseInt(req.params.questionPosition);
  const answerIds: Array<number> = req.body.answerIds;
  const response = adminPlayerSubmit(answerIds, playerId, questionPosition);
  save();
  return res.json(response);
});

app.get('/v1/player/:playerId/question/:questionPosition', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerId);
  const questionPosition: number = parseInt(req.params.questionPosition);
  const response = adminPlayerQuestionInfo(playerId, questionPosition);
  return res.json(response);
});

// adminQuizThumbnailUpdate PUT request route
app.put('/v1/admin/quiz/:quizId/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.header('token');
  const { imgUrl } = req.body;
  const session = getSessionV2(token);
  const response = adminQuizThumbnailUpdate(quizId, session.userId, imgUrl);
  save();
  return res.json(response);
});

app.post('/v1/admin/quiz/:quizId/session/start', (req: Request, res: Response) => {
  const token = req.header('token');
  const autoStartNum = req.body.autoStartNum;
  const quizId = parseInt(req.params.quizId);

  const session = getSessionV2(token);

  const response = adminQuizSessionStart(session.userId, quizId, autoStartNum);

  save();
  return res.json(response);
});

// adminQuizSessions GET request route
app.get('/v1/admin/quiz/:quizId/sessions', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizId);

  const session = getSessionV2(token);

  const response = adminQuizSessions(session, quizId);

  return res.json(response);
});

// GET /v1/admin/quiz/{quizid}/session/{sessionid} route
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const session = getSessionV2(token);
  const userId = session.userId;
  const response = adminQuizSessionStatus(quizId, sessionId, userId);

  return res.json(response);
});

// GET /v1/admin/quiz/{quizid}/session/{sessionid}/results route
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const session = getSessionV2(token);
  const userId = session.userId;
  const response = adminQuizSessionResults(quizId, sessionId, userId);

  return res.json(response);
});

// GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv route
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const session = getSessionV2(token);
  const userId = session.userId;
  const response = adminQuizSessionResultsCsv(quizId, sessionId, userId);

  return res.json(response);
});

// statusOfGuestPlayer GET request route
app.get('/v1/player/:playerId', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);

  const response = guestPlayerStatus(playerId);

  return res.json(response);
});

// allChatMessages GET request route
app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);

  const response = allChatMessages(playerId);

  return res.json(response);
});

// sendChatMessage POST request route
app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const sendMessage = req.body.message;

  const response = sendChatMessage(playerId, sendMessage);

  save();
  return res.json(response);
});

app.get('/v1/player/:playerId/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const response = adminQuizPlayerResults(playerId);
  save();
  return res.json(response);
});

app.get('/v1/csv-results/:sessionId', (req: Request, res: Response) => {
  const sessionId= req.params.sessionId as string;
  res.sendFile(`../crv-results/${sessionId}`);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// Default USE request for handling error cases
app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
