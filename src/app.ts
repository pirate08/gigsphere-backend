import express from 'express';
import connectDb from './config/db';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/auth.routes';
import protectedRoutes from './routes/protected';

dotenv.config();
connectDb();

const app = express();

app.use(cors());
app.use(express.json());

// --Public auth routes--
app.use('/api/auth', router);

// --Protected routes--
app.use('/api/protected', protectedRoutes);

export default app;
