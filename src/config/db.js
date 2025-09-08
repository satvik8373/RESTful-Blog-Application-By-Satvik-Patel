'use strict';

const mongoose = require('mongoose');

let cachedConnection = global.__mongoose_conn__ || null;
let cachedPromise = global.__mongoose_promise__ || null;

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
	if (cachedConnection && cachedConnection.readyState === 1) {
		return cachedConnection;
	}
	if (!cachedPromise) {
		cachedPromise = connectToDatabase(mongoUri).then((conn) => {
			cachedConnection = conn;
			global.__mongoose_conn__ = cachedConnection;
			global.__mongoose_promise__ = cachedPromise;
			return conn;
		});
	}
	return cachedPromise;
}

module.exports = { connectToDatabase, ensureDatabaseConnection };


