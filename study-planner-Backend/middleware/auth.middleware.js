import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token Provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // It will fetch the user from database
        const user = await User.findById(verified.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user; // it will get user object and attach it to the request
        next(); // it will call mext mmiddleware
    } catch (error) {
        // console.error("Authentication error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }

}