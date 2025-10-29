// errorResponse.js - Custom error class for API errors

/**
 * Custom error class extending the native JavaScript Error.
 * Allows passing a custom HTTP status code along with the error message.
 * This is used by the central error handling middleware in server.js.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Call the parent constructor (Error)
    super(message);
    // Attach the HTTP status code
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;