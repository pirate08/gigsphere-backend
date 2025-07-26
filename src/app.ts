import express from 'express';
import connectDb from './config/db';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/auth.routes';

dotenv.config();
connectDb();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', router);

export default app;
