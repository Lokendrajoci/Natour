// const fs = require('fs');
const APIFeatures = require('../Utils/apiFeatures');
const Tour = require('../models/tourModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,duration,difficulty,rating,summary';
  next();
};

exports.getAllTour = catchAsync(async (req, res, next) => {
  // 7. Execute
  const fetures = new APIFeatures(Tour.find(), req.query);
  fetures.filter().sort().limitFields().paginate();
  const tours = await fetures.query;

  // 8. Send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.postTour = catchAsync(async (req, res, next) => {
  console.log(Tour); // Check what the Tour object contains
  const newTour = await Tour.create(req.body); // Create a new tour
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // try {
  // } catch (err) {
  //   console.error('Error creating a tour:', err);
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message || 'Unable to create tour',
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  // const tour = tours.find((el) => el.id === parseInt(req.params.id));

  await Tour.findById(req.params.id).then((tour) => {
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  });
});

exports.patchTour = catchAsync(async (req, res, next) => {
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour: '<Updated tour here...>',
  //   },
  // });

  // Find and update the tour
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Validate the update against the schema
  });

  // Check if the tour exists
   if (!tour) {
     return next(new AppError('No tour found with that ID', 404));
   }

  // Respond with the updated tour
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour=await Tour.findByIdAndDelete(req.params.id);
   if (!tour) {
     return next(new AppError('No tour found with that ID', 404));
   }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // Convert string to number

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
