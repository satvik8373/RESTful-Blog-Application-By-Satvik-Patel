'use strict';

const path = require('path');
const express = require('express');
const { app: apiApp } = require('../src/server');

// Serve static frontend first, then mount the API app at root.
// The API app itself mounts routes under /api, so we do not prefix here.
const app = express();
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use(apiApp);

module.exports = app;


