import { createServer } from "http";

import express from "express";
import helmet from "helmet";

import routes from "./routes";


const app = express();
const server = createServer(app);

app.use(helmet());

routes(app);

export default server;
