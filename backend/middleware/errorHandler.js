// middleware/errorHandler.js
import  logger  from "../config/logger.js";

 const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message} | ${req.originalUrl}`);

  const status = err.statusCode || 500;
  const message = err.message || "Server Error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
export default errorHandler;