import http from 'http';
import dotenv from 'dotenv';

import app from "./src/app";

dotenv.config();
const server = http.createServer(app);
const port = process.env.PORT;

server.listen(port, () => {
    console.log(`Server is started at port: ${port}`);
});

