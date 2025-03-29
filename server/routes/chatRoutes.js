import express from 'express';
import { generateToken, createChannel, deleteChannel } from '../controllers/chatController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get Stream Chat token for the authenticated user
router.post('/token', auth, generateToken);

// Create a new chat channel
router.post('/channel', auth, createChannel);

// Delete a chat channel
router.delete('/channel/:channelId', auth, deleteChannel);

export default router; 