'use strict';

// Vercel Node.js Serverless Function entrypoint.
// Export the Express app directly; Vercel treats it as a (req, res) handler.
const { app } = require('../src/server');

module.exports = app;


