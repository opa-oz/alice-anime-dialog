import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isProduction = process.env.NODE_ENV === 'production';

const dailyRotateTransport = new DailyRotateFile({
    filename: 'combined.log.%DATE%',
    dirname: 'logs',
    dataPattern: 'YYYY-MM-DD',
    zippedArchive: true,
    frequency: '1d'
} as DailyRotateFile.DailyRotateFileTransportOptions);

const options = {
    level: isProduction ? 'info' : 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'alice-anime' },
    transports: [
        dailyRotateTransport
    ],
};

const logger = winston.createLogger(options);

if (!isProduction) {
    logger.add(
        new winston.transports.Console({ format: winston.format.simple() })
    );
}

export default logger;
