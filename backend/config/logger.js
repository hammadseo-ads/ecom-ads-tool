// config/logger.js
import winston from "winston";
import morgan from "morgan";

// Winston transports
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(
        (info) =>
          `${info.timestamp} [${info.level}]: ${info.message}`
      )
    ),
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: winston.format.json(),
  }),
  new winston.transports.File({
    filename: "logs/combined.log",
    format: winston.format.json(),
  }),
];

const  logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});

// Morgan stream to Winston
const morganStream = {
  write: (message) => logger.info(message.trim()),
};

const morganMiddleware = morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev",
  { stream: morganStream }
);
export default logger;
export { morganMiddleware };