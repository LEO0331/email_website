const {
  getCurrentUser,
  loginDemoUser,
  logoutDemoUser,
} = require('../services/demoStore');

module.exports = app => {
  app.get('/api/current_user', (req, res) => {
    res.send(getCurrentUser());
  });

  // Demo auth endpoint that simulates successful OAuth login.
  app.get('/auth/google', (req, res) => {
    loginDemoUser();
    res.redirect('/surveys');
  });

  app.get('/api/logout', (req, res) => {
    logoutDemoUser();
    res.redirect('/signin');
  });
};
