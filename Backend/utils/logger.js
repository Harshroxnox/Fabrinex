import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Logging levels:
// error: 0,
// warn: 1,
// info: 2,
// http: 3,
// verbose: 4,
// debug: 5,
// silly: 6

// Example Usage of logging:
// logger.info("hello world!");
// logger.warn("this is a warning");
// logger.error("an error message");

const myFormat = format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const context = meta.context ? JSON.stringify(meta.context, null, 2) : '';
  const stackTrace = stack || meta.stack || '';

  // Construct log 
  let log = `[${timestamp}] [${level}]: ${message}`;
  if(context){
    log = log + `\nContext:\n${context}`;
  }
  if(stackTrace){
    log = log + `\nStack:\n${stackTrace}`
  }

  return log;
});

const logger = createLogger({
  level: 'debug',
  transports: [
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // include stack trace
        myFormat
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // include stack trace
        myFormat
      )
    })
  ]
});

// While in development also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(), 
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      myFormat,
    )
  }));
}

export default logger;
