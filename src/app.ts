import express from 'express';
import bodyParser from "body-parser";


import dialog from './middlewares/dialog';

const app = express();

app.use(bodyParser.json());

app.post('/dialog', dialog);

export default app;
