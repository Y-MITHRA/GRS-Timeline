import Chat from './Chat';

const GrievanceDetails = ({ grievance }) => {
    return (
        <div className="grievance-details">
            {/* Chat Section */}
            {grievance && grievance.assignedOfficials && grievance.assignedOfficials.length > 0 && (
                <div className="chat-section mt-4">
                    <h3>Chat with Official</h3>
                    <Chat
                        grievanceId={grievance._id}
                        petitionerId={grievance.petitioner}
                        officialId={grievance.assignedOfficials[0]}
                    />
                </div>
            )}
        </div>
    );
};

export default GrievanceDetails; 