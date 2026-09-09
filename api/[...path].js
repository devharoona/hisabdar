const { app, connectDb } = require('../backend/server');

module.exports = async (req, res) => {
  const originalUrl = req.url;
  const [pathname] = originalUrl.split('?');
  req.url = originalUrl.replace(/^\/api(?=\/|$)/, '') || '/';

  try {
    await connectDb();
  } catch {
    if (pathname === '/api/health') return app(req, res);
    return res.status(503).json({ error: 'Database is unavailable' });
  }

  return app(req, res);
};
