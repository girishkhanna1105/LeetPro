import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { updateAllUsersStats } from './services/leetcodeService.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoconnector= async()=>{ 
    try {
       await mongoose.connect(process.env.MONGO_URI)
  } 
  catch (error) {
    console.log("mongo db error ", error);
  }
}
    mongoconnector().then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/api', (req, res) => res.send('API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Cron job to refresh stats daily at midnight UTC
cron.schedule('0 0 * * *', () => {
    console.log('Running daily cron job: Updating all user stats...');
    updateAllUsersStats();
}, {
    timezone: "Etc/UTC"
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));