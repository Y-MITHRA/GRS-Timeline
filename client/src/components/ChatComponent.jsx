import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    Window,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    LoadingIndicator,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { useAuth } from '../context/AuthContext';

const STREAM_API_KEY = 'pnn5rnnuzvzq';

const ChatComponent = ({ grievanceId }) => {
    const { user, authenticatedFetch } = useAuth();
    const [client, setClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !grievanceId) {
            console.log('Missing user or grievanceId:', { user, grievanceId });
            return;
        }

        const initChat = async () => {
            try {
                setLoading(true);
                console.log('Initializing chat for user:', user.id, 'grievance:', grievanceId);

                // Get token from backend
                const response = await authenticatedFetch('http://localhost:5000/api/chat/token', {
                    method: 'POST',
                    body: JSON.stringify({ userId: user.id })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to get chat token');
                }
                const { token } = await response.json();
                console.log('Received token from backend');

                const chatClient = StreamChat.getInstance(STREAM_API_KEY);

                // Connect user to Stream with the token from backend
                await chatClient.connectUser(
                    {
                        id: user.id,
                        name: user.name || `User ${user.id}`,
                        role: user.role,
                    },
                    token
                );
                console.log('Connected user to Stream Chat');

                // Create or join channel for this grievance
                const channelId = `grievance-${grievanceId}`;
                const newChannel = chatClient.channel('messaging', channelId, {
                    name: `Grievance Discussion ${grievanceId}`,
                    members: [user.id],
                });

                await newChannel.watch();
                console.log('Channel watched successfully');

                setClient(chatClient);
                setChannel(newChannel);
                setError(null);
            } catch (error) {
                console.error('Error initializing chat:', error);
                setError(error.message || 'Failed to initialize chat');
            } finally {
                setLoading(false);
            }
        };

        initChat();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [user, grievanceId, authenticatedFetch]);

    if (error) {
        return (
            <div className="chat-error" style={{ padding: '20px', color: 'red' }}>
                Error: {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <LoadingIndicator />
                <p>Initializing chat...</p>
            </div>
        );
    }

    if (!client || !channel) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Chat not available</p>
            </div>
        );
    }

    return (
        <div className="chat-wrapper" style={{ height: '500px' }}>
            <Chat client={client} theme="messaging light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
};

export default ChatComponent; 