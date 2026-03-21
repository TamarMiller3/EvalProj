require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const { connect } = require('./src/storage/db');

const evaluationsRouter = require('./src/routes/evaluations');
const adminRouter       = require('./src/routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/evaluations', evaluationsRouter);
app.use('/api/admin',       adminRouter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB first, then start server
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
