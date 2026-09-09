const { app, connectDb } = require('../backend/server');

const port = Number(process.env.API_PORT || 4000);

connectDb()
  .then(() => app.listen(port, () => console.log(`Hisabdar API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  });
