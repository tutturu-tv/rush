import { createServer } from 'http';

import express from 'express';
import helmet from 'helmet';

import routes from './routes';


const ENV = process.env.NODE_ENV || 'development';
const app = express();
const server = createServer(app);

if (ENV !== 'development') app.use(helmet());

routes(app);

export default server;
