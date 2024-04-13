import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { userCreateRequest, quizCreateRequestV2 } from '../requests';
const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;
