'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet'); // Add Helmet for security

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Apply Helmet to set Content Security Policies
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false, // To handle any cross-origin errors for embedders
  })
);

// Serve static files
app.use('/public', express.static(process.cwd() + '/public'));

// Enable CORS (for FCC testing purposes only)
app.use(cors({ origin: '*' }));

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// FCC Testing routes
fccTestingRoutes(app);

// API routing
apiRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found');
});

// Start the server and run tests
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // For testing
