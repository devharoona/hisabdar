const { app, connectDb } = require('../backend/server');

module.exports = async (req, res) => {
  const originalUrl = req.url || '/';
  const [pathname] = originalUrl.split('?');
  const isHealthCheck = pathname === '/api/health';

  // Express defines health as /health, while all other routes use /api/...
  if (isHealthCheck) {
    req.url = originalUrl.replace(/^\/api\/health/, '/health');
  }

  try {
    await connectDb();
  } catch {
    if (isHealthCheck) return app(req, res);
    return res.status(503).json({ error: 'Database is unavailable' });
  }

  return app(req, res);
};
