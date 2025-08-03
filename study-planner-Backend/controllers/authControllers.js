import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log("Incoming registration data:", req.body);

    try {
        const userExisting = await User.findOne({ email });
        if (userExisting) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log("User registered successfully:", user.email);
        res.status(200).json({ status: 200, token, data: { id: user._id, name: user.name, email: user.email, role: user.role }, message: 'User registered successfully' });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Incoming login data:", req.body);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });

        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("User logged in successfully:", user.email);
        res.json({ token, role: user.role, id: user._id });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Login failed server error", error: error.message });
    }
};

export { register, login };