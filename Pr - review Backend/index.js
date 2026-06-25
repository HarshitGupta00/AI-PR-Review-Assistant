require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

const authRoutes      = require('./src/routes/authRoutes');
const reviewRoutes    = require('./src/routes/reviewRoutes');
const repoRoutes      = require('./src/routes/repoRoutes');
const userRoutes      = require('./src/routes/userRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/repos',     repoRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});