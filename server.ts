import http from 'http';
import dotenv from 'dotenv';

dotenv.config();
import app from "./src/app";
import logger from "./src/utils/logger";

const server = http.createServer(app);
const port = process.env.PORT;

server.listen(port, () => {
    logger.debug(`Server is started at port: ${port}`);
});

