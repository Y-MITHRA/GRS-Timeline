import React from 'react';
import { WyChat, useWeavy } from '@weavy/uikit-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Chat.css';

const ChatComponent = ({ grievanceId }) => {
    const { user } = useAuth();
    const chatId = `grievance-${grievanceId}`;

    // Initialize Weavy with proper configuration
    const weavy = useWeavy({
        url: "https://e74ed498731949bfb3c9d95f2d2455e5.weavy.io",
        tokenFactory: async () => {
            try {
                const token = localStorage.getItem('weavyToken');
                if (!token) {
                    console.error('No Weavy token found');
                    return null;
                }
                console.log('Using Weavy token:', token); // Debug log
                return token;
            } catch (error) {
                console.error('Error getting Weavy token:', error);
                return null;
            }
        }
    });

    // Check if user is available
    if (!user) {
        return <div>Loading...</div>;
    }

    // Get the current user's ID
    const currentUserId = user._id || user.id;

    console.log('Chat Component Debug:', {
        user,
        currentUserId,
        grievanceId,
        chatId,
        weavyToken: localStorage.getItem('weavyToken')
    });

    return (
        <div className="chat-container">
            <WyChat
                uid={chatId}
                title={`Grievance #${grievanceId}`}
                members={[currentUserId]}
            />
        </div>
    );
};

export default ChatComponent;
