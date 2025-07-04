const Review = require('../models/reviewModel');
const catchAsync = require('../Utils/catchAsync');
// const AppError = require('../Utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // If tourId is provided in the URL, filter reviews by that tour
  let filter = {};

  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) {
    // Allow the user to create a review without specifying a tour
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    // Allow the user to create a review without specifying a user
    req.body.user = req.user.id; // Assuming req.user is populated by auth middleware
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
