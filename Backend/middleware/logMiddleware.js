import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', ()=>{
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const responseTime = Date.now() - start;
    const ip = req.ip;

    let level = 'info';
    if (statusCode >= 500) level = 'error';
    else if (statusCode >= 400) level = 'warn';

    logger.log({
      level,
      message: `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - IP: ${ip}`
    });

    console.log(`[${level}]: ${method} ${originalUrl} ${statusCode} - ${responseTime}ms - IP: ${ip}`);
  })

  next();
};

export default requestLogger;
