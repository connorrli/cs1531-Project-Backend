// Import statements of various packages/libraries that we will leverage for the project
import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
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
import { adminQuizQuestionCreateV2 } from './Iter3/quizV2';

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
const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(getData()));
};

// Save current `trash` trashStore object state into trashbase.json
const saveTrash = () => {
  fs.writeFileSync('./trashbase.json', JSON.stringify(getTrash()));
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
  const response = adminAuthLogout(token);

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
  const response = adminQuizRestore(token, quizId);
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

  const response = adminAuthLogout(token);

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
  res.json(response);
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
