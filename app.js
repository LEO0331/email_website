const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

require('./routes/surveyRoutes')(app);

const clientBuildPath = path.join(__dirname, 'client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

module.exports = app;
