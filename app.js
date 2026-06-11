const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const requestContext = require('./middlewares/requestContext');

const app = express();
app.use(express.json());
app.use(requestContext);

require('./routes/surveyRoutes')(app);
require('./routes/authRoutes')(app);

const clientBuildPath = path.join(__dirname, 'client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

module.exports = app;
