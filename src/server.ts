import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan, { token } from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { setData, getData } from './dataStore';
import { getSession } from './helpers/sessionHandler';
import { adminUserDetails, adminAuthRegister, adminAuthLogin, adminUserPasswordUpdate } from './auth';
import { adminQuizCreate, adminQuizList, adminQuizInfo, adminQuizNameUpdate } from './quiz';
import { AdminQuizListReturn } from './quiz';
import { ErrorObject } from './interface';
import { getTrash, setTrash } from './trash';
import { clear } from './other';

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

// Loads the database.json file and sets the data into dataStore if it exists
const load = () => {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json', { encoding: 'utf8' });
    setData(JSON.parse(file));
  }
}
load();

// Loads the trashbase.json file and sets the trash into trashStore if it exists
const loadTrash = () => {
  if (fs.existsSync('./trashbase.json')) {
    const file = fs.readFileSync('./trashbase.json', { encoding: 'utf8' });
    setTrash(JSON.parse(file));
  }
}
loadTrash();

// Save current `data` dataStore object state into database.json
const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(getData()));
} 

// Save current `trash` trashStore object state into trashbase.json
const saveTrash = () => {
  fs.writeFileSync('./trashbase.json', JSON.stringify(getTrash()));
} 

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);
  
  const response = adminUserDetails(session.userId);
  return res.json(response);
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
  if ('error' in response) res.status(400).json(response);
  
  save();
  return res.json(response);
});

// adminUserDetails GET request route
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const session = getSession(token);
  if ('error' in session) return res.status(401).json(session);
  
  return res.json(adminUserDetails(session.userId));
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

// Quiz Create
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const body = req.body;
  const token = body.token;
  const session = getSession(token);
  if ('error' in session) {
    return res.status(401).json({ error: "Token is invalid." });
  }
  const name = body.name;
  const description = body.description;
  const response = adminQuizCreate (session.userId, name, description);
  if ('error' in response) { res.status(400) } else { res.status(200) };
  save();
  return res.json(response);
});

// Quiz List
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const query = req.query;
  const token = query.token as string;
  const session = getSession(token);
  let response: AdminQuizListReturn | ErrorObject;
  
  if (('error' in session)) {
    return res.status(401).json({ error: "Token is invalid or empty" });
  } else {
    response = adminQuizList(session.userId);
  }
  res.status(200);
  return res.json(response);
});

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string; 
  return res.json(echo(data));
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  save();
  res.json(response);
});

// adminQuizInfo Route
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }
  const session = getSession(token);
  if (!session || !('userId' in session)) {
    return res.status(401).json({ error: "Invalid session" });
  }
  const userId = session.userId;
  const response = adminQuizInfo(userId, quizId);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  return res.status(200).json(response);
});

// adminQuizNameUpdate Route
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const name = req.body.name;
  const token = req.query.token as string; // Does every function come with a token in the query???
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }
  const session = getSession(token);
  if (!session || !('userId' in session)) {
    return res.status(401).json({ error: "Invalid session" });
  }
  const userId = session.userId;
  const response = adminQuizNameUpdate(userId, quizId, name);
  if ('error' in response) {
    return res.status(403).json(response);
  }
  save();
  return res.status(200).json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
