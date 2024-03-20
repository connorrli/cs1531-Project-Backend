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
import { adminQuizCreate, adminQuizList } from './quiz';

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

// Save current `data` dataStore object state into database.json
const save = () => {
  fs.writeFileSync('./database.json', JSON.stringify(getData()));
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
  const name = body.name;
  const description = body.description;
  const response = adminQuizCreate (token, name, description);

  if (!token || token !== session) {
    return res.status(401).json({ error: "Token is empty or invalid" });
  }
  if ('error' in response) { res.status(400) } else { res.status(200) };
  save();
  return res.json(response);
});

// Quiz List
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const query = req.query;
  const token = query.token as string;
  const session = getSession(token);
  const response = adminQuizList(token); //Issue here

  if (!token || ('error' in session)) {
    return res.status(401).json({ error: "Token is invalid or empty" });
  }
  else { res.status(200) };
  return res.json(response);
});

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string; 
  return res.json(echo(data));
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
