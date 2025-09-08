'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectToDatabase } = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'));

// Health route
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// API routes
app.use('/', routes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
	const mongoUri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/blog?authSource=admin';
	await connectToDatabase(mongoUri);
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}

if (require.main === module) {
	start().catch((error) => {
		console.error('Failed to start server:', error);
		process.exit(1);
	});
}

module.exports = { app, start };


