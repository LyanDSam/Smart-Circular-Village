const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const cors = require('cors');

const deviceRoutes = require('./routes/deviceRoutes');
const { errorMiddleware } = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS & JSON parsing
app.use(cors({ origin: true }));
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Smart Circular Village (SCV) Cloud Functions REST API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Device REST API Router
app.use('/api/device', deviceRoutes);

// Global Error Handler
app.use(errorMiddleware);

// Export Cloud Function endpoint `api`
exports.api = onRequest({ cors: true, region: 'asia-southeast1' }, app);
