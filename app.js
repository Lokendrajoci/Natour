const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const fs = require('fs');
// const hpp = require('http');

const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./controller/errorController');
//  1) MIDDLEWARES



const app = express();

app.use(helmet());

// 2) GLOBAL MIDDLEWARES

// Implementing a rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});

// Apply the rate limiter to all requests
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

//data sanitization against NoSQL query injection

app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
