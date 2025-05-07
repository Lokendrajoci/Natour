// Description: This function is used to handle errors in asynchronous functions in Express.js.
// It takes a function as an argument and returns a new function that catches any errors
// that occur during the execution of the original function. If an error occurs, it calls the next
// middleware with the error, allowing for centralized error handling.

module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
