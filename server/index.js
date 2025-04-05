import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000', // Main GRS portal
        'http://localhost:3001', // RTO Portal
        'http://localhost:3002', // Water Portal
        'http://localhost:3003'  // Admin Portal
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/user', userRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 