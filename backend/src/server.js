const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sites', require('./routes/sites'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/radiologists', require('./routes/radiologists'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/optimization', require('./routes/optimization'));
app.use('/api/time-estimates', require('./routes/timeEstimates'));
app.use('/api/procedures', require('./routes/procedures'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

