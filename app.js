const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./Utils/appError');
const globalErrorHandler = require('./controller/errorController');
//  1) MIDDLEWARES

const express = require("express");
const fs = require("fs");

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

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);


//before every request, this middleware will be executed
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();

app.get("/api/v1/tours", (req, res) => {
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });

});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();


  next();

//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       if (err) {
//         console.error('Error writing file:', err);
//         return res
//           .status(500)
//           .json({ status: 'fail', message: 'Could not write file' });
//       }
//       res.status(201).json({ status: 'success', data: { tour: newTour } });
//     }
//   );
// });

app.post("/api/v1/tours", (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  try {
    fs.writeFileSync(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours)
    );
    res.status(201).json({ status: "success", data: { tour: newTour } });
  } catch (err) {
    console.error("Error writing file:", err);
    res.status(500).json({
      status: "fail",
      message: "Could not write file",
      error: err.message,
    });
  }

});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
