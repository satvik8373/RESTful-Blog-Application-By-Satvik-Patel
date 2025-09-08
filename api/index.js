'use strict';

const path = require('path');
const express = require('express');
const { app: apiApp } = require('../src/server');

// Mount the API app first so /api/* isn't intercepted by static middleware.
// Mount under both '/' and '/api' to handle Vercel rewrites that may strip or keep '/api'.
const app = express();
app.use('/api', apiApp);
app.use('/', apiApp);
app.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = app;


