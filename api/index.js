'use strict';

const path = require('path');
const express = require('express');
const { app: apiApp } = require('../src/server');

// Mount the API app first so /api/* isn't intercepted by static middleware.
// The API app mounts its own /api routes.
const app = express();
app.use(apiApp);
app.use('/', express.static(path.join(__dirname, '..', 'public')));

module.exports = app;


