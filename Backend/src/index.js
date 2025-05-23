import express from 'express';
import cors from 'cors';
import "dotenv/config"

import authRoutes from './Routes/authRoutes.js';
import workoutRoutes from './Routes/workoutRoutes.js';

import { connectDB } from './libs/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',authRoutes);
app.use('/api/workout',workoutRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
