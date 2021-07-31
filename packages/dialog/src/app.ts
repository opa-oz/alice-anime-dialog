import express from 'express';
import bodyParser from "body-parser";

import dialog from './middlewares/dialog';
import logger from "./utils/logger";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

app.use(bodyParser.json());

app.post('/api/dialog', dialog);

app.get('/api/ping', (_req, res) => {
    res.send('OK;')
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    logger.error(err.stack);

    res.status(500);
    res.json(isProduction ? { request: 'failed' } : err.stack);
})

export default app;
