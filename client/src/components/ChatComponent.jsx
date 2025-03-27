import React from 'react';
import { useWeavy, WyChat } from "@weavy/uikit-react";
import { useAuth } from "../context/AuthContext";

export function ChatComponent({ grievanceId, assignedTo }) {
    const { user } = useAuth();

    useWeavy({
        url: "https://e74ed498731949bfb3c9d95f2d2455e5.weavy.io",
        tokenFactory: async () => "wyu_SrSIdJArOxbF2aDLqijA8hd2ZkWUEe1aFobh"
    });

    // Create a unique chat ID using the grievance ID
    const chatId = `grievance-${grievanceId}`;

    // Only render the chat if we have a valid user
    if (!user) {
        return <div>Loading chat...</div>;
    }

    // Log user data for debugging
    console.log('User data:', {
        user,
        userId: user.id, // Try both id and _id
        userRole: user.role,
        assignedTo
    });

    // Determine if the current user is the petitioner or the assigned official
    const isPetitioner = user.role === 'petitioner';
    const isOfficial = user.role === 'official';

    // Get the current user's ID (try both id and _id)
    const currentUserId = user.id || user._id;

    // For officials, check if they are assigned to this grievance
    const isAssignedOfficial = isOfficial && assignedTo && (
        currentUserId === assignedTo._id ||
        currentUserId === assignedTo.id ||
        currentUserId === assignedTo // Handle both object and ID cases
    );

    // Log authorization check for debugging
    console.log('Authorization check:', {
        isPetitioner,
        isOfficial,
        isAssignedOfficial,
        currentUserId,
        assignedToId: assignedTo?.id || assignedTo?._id,
        userMatch: assignedTo ? (
            currentUserId === assignedTo._id ||
            currentUserId === assignedTo.id ||
            currentUserId === assignedTo
        ) : false
    });

    // Allow access if user is petitioner or assigned official
    if (!isPetitioner && !isAssignedOfficial) {
        return <div>You are not authorized to access this chat.</div>;
    }

    // Get the other participant's name for the chat title
    const otherParticipant = isPetitioner
        ? assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Official'
        : 'Petitioner';

    // Ensure we have valid user IDs for the chat
    const chatMembers = [currentUserId];
    if (assignedTo) {
        const assignedToId = assignedTo.id || assignedTo._id || assignedTo;
        chatMembers.push(assignedToId);
    }

    return (
        <div className="chat-container" style={{ height: '500px' }}>
            <WyChat
                uid={chatId}
                title={`Chat for Grievance ${grievanceId} with ${otherParticipant}`}
                members={chatMembers.filter(Boolean)}
            />
        </div>
    );
} 