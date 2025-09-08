'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { connectToDatabase } = require('../src/config/db');
const routes = require('../src/routes');
const { notFound, errorHandler } = require('../src/middlewares/errorHandler');

let dbPromise;
function ensureDbConnection() {
	if (!dbPromise) {
		const mongoUri = process.env.MONGODB_URI;
		if (!mongoUri) throw new Error('MONGODB_URI is not set');
		dbPromise = connectToDatabase(mongoUri);
	}
	return dbPromise;
}

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Only ensure DB for API routes
app.use('/api', async (req, res, next) => {
	try {
		await ensureDbConnection();
		next();
	} catch (err) {
		next(err);
	}
});

// Health (root and /api)
app.get(['/health', '/api/health'], (req, res) => {
	res.json({ status: 'ok' });
});

// Serve static frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Mount API at /api
app.use('/api', routes);

// Fallback to index.html for root
app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = (req, res) => app(req, res);


