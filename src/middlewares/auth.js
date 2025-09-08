'use strict';

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
	if (!token) return res.status(401).json({ message: 'Missing token' });

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		req.user = { userId: payload.userId, role: payload.role };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

function authorize(roles) {
	return function (req, res, next) {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}

module.exports = { authenticate, authorize };


