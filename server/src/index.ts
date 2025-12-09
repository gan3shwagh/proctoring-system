import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import examsRouter from './routes/exams';
import violationsRouter from './routes/violations';
import sessionsRouter from './routes/sessions';
import examManagementRouter from './routes/exam-management';
import institutesRouter from './routes/institutes';
import profileRouter from './routes/profile';
import usersRouter from './routes/users';
import adminInstitutesRouter from './routes/admin-institutes';

dotenv.config();

import { createServer } from 'http';
import { initSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Routes
app.use('/api/exams', examsRouter);
app.use('/api/exam-management', examManagementRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/institutes', institutesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminInstitutesRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static files from the client dist directory
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Handle React routing, return all requests to React app
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

