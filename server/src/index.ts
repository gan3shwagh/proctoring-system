import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import examsRouter from './routes/exams';
import violationsRouter from './routes/violations';
import sessionsRouter from './routes/sessions';
import examManagementRouter from './routes/exam-management';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Routes
app.use('/api/exams', examsRouter);
app.use('/api/exam-management', examManagementRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/sessions', sessionsRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
