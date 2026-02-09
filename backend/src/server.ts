import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

// Middleware
// CORS configuration - allow frontend URLs in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import requisitionsRouter from './routes/requisitions';
import patientPortalRouter from './routes/patientPortal';
import apiKeysRouter from './routes/apiKeys';
import sitesRouter from './routes/sites';
import facilitiesRouter from './routes/facilities';
import radiologistsRouter from './routes/radiologists';
import schedulesRouter from './routes/schedules';
import ordersRouter from './routes/orders';
import optimizationRouter from './routes/optimization';
import timeEstimatesRouter from './routes/timeEstimates';
import proceduresRouter from './routes/procedures';

// Auth routes (public)
app.use('/api/auth', authRouter);

// Requisitions routes (public submission, admin management)
app.use('/api/requisitions', requisitionsRouter);

// Patient portal routes (public)
app.use('/api/patient-portal', patientPortalRouter);

// API Keys management (admin only)
app.use('/api/api-keys', apiKeysRouter);

// User management routes (admin only)
app.use('/api/users', usersRouter);

// Protected routes (add authentication middleware as needed)
app.use('/api/sites', sitesRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/radiologists', radiologistsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/optimization', optimizationRouter);
app.use('/api/time-estimates', timeEstimatesRouter);
app.use('/api/procedures', proceduresRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
