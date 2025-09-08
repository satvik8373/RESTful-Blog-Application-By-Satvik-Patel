'use strict';

const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
	if (!mongoUri) {
		throw new Error('MONGODB_URI is not defined');
	}

	mongoose.set('strictQuery', true);

	await mongoose.connect(mongoUri, {
		autoIndex: true,
		serverSelectionTimeoutMS: 15000
	});

	return mongoose.connection;
}

async function ensureDatabaseConnection(mongoUri) {
	if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
		return mongoose.connection;
	}
	return connectToDatabase(mongoUri);
}

module.exports = { connectToDatabase, ensureDatabaseConnection };


