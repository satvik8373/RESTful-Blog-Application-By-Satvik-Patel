'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const serverless = require('serverless-http');

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

// Ensure DB before handling routes
app.use(async (req, res, next) => {
	try {
		await ensureDbConnection();
		next();
	} catch (err) {
		next(err);
	}
});

// Health
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Mount app routes at root. On Vercel this function lives under /api
app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = serverless(app);


