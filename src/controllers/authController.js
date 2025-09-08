'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../validators/auth');
const User = require('../models/User');

async function register(req, res) {
	const { error, value } = registerSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });

	const { username, password } = value;
	const email = value.email.toLowerCase().trim();
	const existing = await User.findOne({ $or: [{ email }, { username }] });
	if (existing) return res.status(409).json({ message: 'User already exists' });

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ username, email, passwordHash });
	return res.status(201).json({ id: user._id, username: user.username, email: user.email });
}

async function login(req, res) {
	const { error, value } = loginSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });

	const email = value.email.toLowerCase().trim();
	const { password } = value;
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });

	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

	const token = jwt.sign(
		{ userId: user._id.toString(), role: user.role },
		process.env.JWT_SECRET || 'dev-secret',
		{ expiresIn: '7d' }
	);
	return res.json({ token });
}

module.exports = { register, login };


