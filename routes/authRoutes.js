const DEMO_COOKIE = 'demo_auth';
const demoUser = {
  id: 'demo-user',
  name: 'Demo User',
  credits: 5,
};

function readCookie(req, key) {
  const raw = req.headers && req.headers.cookie;
  if (!raw) return '';

  const value = raw
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${key}=`));

  return value ? value.slice(key.length + 1) : '';
}

module.exports = app => {
  app.get('/api/current_user', (req, res) => {
    const isAuthed = readCookie(req, DEMO_COOKIE) === '1';
    res.send(isAuthed ? demoUser : false);
  });

  // Demo auth endpoint that simulates successful OAuth login.
  app.get('/auth/google', (req, res) => {
    res.cookie(DEMO_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 12,
    });
    res.redirect('/surveys');
  });

  app.get('/api/logout', (req, res) => {
    res.clearCookie(DEMO_COOKIE);
    res.redirect('/signin');
  });
};
