const _enum = require("../config/enum");
const CustomError = require("./error");
const config = require("../config/environments");

class Response {
  static successResponse(data) {
    return {
      data,
    };
  }
  static serverResponse(data) {
    return {
      data,
    };
  }

  static errorResponse(error) {
    if (error instanceof CustomError) {
      return {
        code: error.code,
        error: {
          message: error.message,
          description: error.description,
        },
      };
    }
  }
}

module.exports = Response;
