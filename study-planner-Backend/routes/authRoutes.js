import express from 'express';
import { register, login } from '../controllers/authControllers.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
});

router.post('/register', register);
router.post('/login', login);

export default router;