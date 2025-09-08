'use strict';

function notFound(req, res, next) {
	res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
	const status = err.status || 500;
	const response = { message: err.message || 'Internal Server Error' };
	if (process.env.NODE_ENV !== 'production' && err.stack) {
		response.stack = err.stack;
	}
	res.status(status).json(response);
}

module.exports = { errorHandler, notFound };
