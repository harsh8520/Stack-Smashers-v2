require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Import API handlers
const signupHandler = require('./api/auth/signup');
const loginHandler = require('./api/auth/login');
const analyzeHandler = require('./api/analyze');
const historyHandler = require('./api/history');
const analysisHandler = require('./api/analysis/[id]');

// Routes
app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/analyze', analyzeHandler);
app.get('/api/history', historyHandler);
app.get('/api/analysis/:id', (req, res) => {
  req.query = { id: req.params.id };
  analysisHandler(req, res);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('\n📍 Available endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/analyze`);
  console.log(`   GET  http://localhost:${PORT}/api/history`);
  console.log(`   GET  http://localhost:${PORT}/api/analysis/:id\n`);
});
