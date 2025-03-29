import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ✅ Admin Registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, adminId, position, password, confirmPassword } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !adminId || !position || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { adminId }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin ID or Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({ firstName, lastName, email, phone, adminId, position, password: hashedPassword });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Login with JWT
router.post('/login', async (req, res) => {
    try {
        const { adminId, email, password } = req.body;

        // Validate input
        if (!adminId && !email) {
            return res.status(400).json({ message: 'Admin ID or Email is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Find admin by either Admin ID or Email
        const admin = await Admin.findOne({ $or: [{ adminId }, { email }] });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid Admin ID or Email' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin._id,
                role: 'admin',
                adminId: admin.adminId,
                email: admin.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with token and user data
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                adminId: admin.adminId,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
