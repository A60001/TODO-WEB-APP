import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import taskListRoutes from './routes/tasklists.routes.js';
import tasksRoutes from './routes/tasks.routes.js';


const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json()); 
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use('/api/auth', authRoutes);

app.use('/api/lists', taskListRoutes);

app.use('/api/lists/:listId/tasks', tasksRoutes);

app.use('/api/tasks', tasksRoutes);

app.use('/api/lists/:listId/tasks', tasksRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong',
  });
});

export default app;
