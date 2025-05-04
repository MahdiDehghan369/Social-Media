const successResponse = (res, statusCode = 200, data) => {
  return res.status(statusCode).json({
    status: statusCode,
    success: true,
    data,
  });
};

const errorResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    status: statusCode,
    success: false,
    data,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
