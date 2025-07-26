import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';

const router = express.Router();

// --Defining route for register page--
router.post('/register', registerUser);
// --Defining route for login page--
router.post('/login', loginUser);

export default router;
