import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { fetchLeetCodeStats } from '../services/leetcodeService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    const { username, email, password, leetcodeUsername } = req.body;

    try {
        if (!username || !email || !password || !leetcodeUsername) {
            return res.status(400).json({ message: 'Please fill all fields.' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { leetcodeUsername }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or LeetCode username already exists.' });
        }

        const initialStats = await fetchLeetCodeStats(leetcodeUsername);
        if (!initialStats) {
            return res.status(400).json({ message: 'Could not find LeetCode user. Please check the username.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            leetcodeUsername,
            statsHistory: [{ ...initialStats, date: new Date() }]
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                leetcodeUsername: user.leetcodeUsername,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                leetcodeUsername: user.leetcodeUsername,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};