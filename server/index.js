import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging middleware

// Debug logging middleware
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('=====================\n');
    next();
});

// Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/chat', chatRoutes);
console.log('Routes registered successfully');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    console.log('\n=== 404 Not Found ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('=====================\n');
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\nServer is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- /api/auth');
    console.log('- /api/grievances');
    console.log('- /api/chat\n');
});

export default app; 