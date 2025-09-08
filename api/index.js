'use strict';

const path = require('path');
const express = require('express');
const { app: apiApp } = require('../src/server');

// Mount API under /api and also serve static frontend from /public
const app = express();
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Support both / and /api prefixes
app.use('/', apiApp);
app.use('/api', apiApp);
app.use('/', express.static(path.join(__dirname, '..', 'public'), {
	setHeaders: (res) => {
		res.setHeader('Cache-Control', 'no-store');
	}
}));

module.exports = app;


