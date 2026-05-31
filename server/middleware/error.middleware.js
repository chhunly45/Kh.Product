const errorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, message: 'Restricted form submission.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  console.error(err);
  res.status(statusCode).json({
    success: false,
    message,
    details
  });
};

module.exports = errorHandler;
