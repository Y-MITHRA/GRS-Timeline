import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
    Window,
    Thread,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { useAuth } from '../context/AuthContext';

const STREAM_API_KEY = 'pnn5rnnuzvzq';

const ChatComponent = ({ grievanceId }) => {
    const { user } = useAuth();
    const [client, setClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                console.log('Initializing chat for user:', user.id, 'grievance:', grievanceId);

                // Get token from backend
                const response = await fetch('http://localhost:5000/api/chat/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ userId: user.id })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    });
                    throw new Error(`Failed to get chat token: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Received response:', data);

                if (!data.token) {
                    throw new Error('No token received from server');
                }

                // Initialize chat client
                const chatClient = StreamChat.getInstance(STREAM_API_KEY);
                await chatClient.connectUser(
                    {
                        id: user.id,
                        name: user.name || user.email,
                        email: user.email
                    },
                    data.token
                );

                // Create or join channel
                const channel = chatClient.channel('messaging', `grievance-${grievanceId}`, {
                    name: `Grievance Chat ${grievanceId}`,
                    grievance_id: grievanceId,
                });

                await channel.watch();
                setChannel(channel);
                setClient(chatClient);
            } catch (error) {
                console.error('Error initializing chat:', error);
                setError(error.message);
            }
        };

        if (user && grievanceId) {
            initChat();
        }

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [user, grievanceId]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!client || !channel) {
        return <div>Loading chat...</div>;
    }

    return (
        <div className="h-[600px]">
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