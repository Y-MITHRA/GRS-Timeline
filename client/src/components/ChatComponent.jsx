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
                // Get user data
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                if (!userData.id) {
                    console.error('No user data found');
                    return null;
                }

                // Create a Weavy user token with the correct format
                const weavyToken = {
                    uid: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    department: userData.department,
                    access_token: "wyu_S4DByQSLiRV7vJnc5NR35UcVTwUGwI3mshBE"
                };

                console.log('Generated Weavy token:', weavyToken);
                return weavyToken;
            } catch (error) {
                console.error('Error generating Weavy token:', error);
                return null;
            }
        }
    });

    // Check if user is available
    if (!user) {
        return <div>Loading...</div>;
    }

    // Get the current user's ID
    const currentUserId = user.id;

    console.log('Chat Component Debug:', {
        user,
        currentUserId,
        grievanceId,
        chatId
    });

    return (
        <div className="chat-container">
            <WyChat
                uid={chatId}
                title={`Grievance #${grievanceId}`}
                members={[currentUserId]}
                options={{
                    authentication: {
                        headers: {
                            'Authorization': `Bearer wyu_S4DByQSLiRV7vJnc5NR35UcVTwUGwI3mshBE`,
                            'Content-Type': 'application/json'
                        }
                    },
                    features: {
                        chat: {
                            enabled: true,
                            maxMessageLength: 1000,
                            typingIndicator: true,
                            readReceipts: true
                        }
                    },
                    app: {
                        uid: chatId,
                        name: `Grievance #${grievanceId}`,
                        type: 'chat'
                    }
                }}
            />
        </div>
    );
};

export default ChatComponent;
