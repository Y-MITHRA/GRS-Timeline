import React, { useState, useEffect } from 'react';
import '../styles/Timeline.css';

const TimelineView = ({ grievanceId }) => {
    const [timelineStages, setTimelineStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTimelineStages();
    }, [grievanceId]);

    const fetchTimelineStages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:5000/api/grievances/${grievanceId}/timeline-stages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch timeline stages');
            }

            const data = await response.json();
            setTimelineStages([
                {
                    stageName: 'Grievance Filed',
                    date: data.timelineStages[0]?.date || new Date().toISOString(),
                    description: 'Grievance submitted to the system'
                },
                ...data.timelineStages
            ]);
        } catch (error) {
            console.error('Error fetching timeline stages:', error);
            setError('Failed to load timeline stages');
        } finally {
            setLoading(false);
        }
    };

    const getStageIcon = (stageName) => {
        switch (stageName) {
            case 'Grievance Filed':
                return '📄';
            case 'Under Review':
                return '🔎';
            case 'Investigation':
                return '🕵️';
            case 'Resolution':
                return '🏁';
            default:
                return '📍';
        }
    };

    if (loading) return <div>Loading timeline...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="timeline-container">
            <h3>Grievance Timeline</h3>
            <div className="timeline">
                {timelineStages.map((stage, index) => (
                    <div key={index} className="timeline-item">
                        <div className="timeline-icon">
                            {getStageIcon(stage.stageName)}
                        </div>
                        <div className="timeline-content">
                            <h4>{stage.stageName}</h4>
                            <p className="date">
                                {new Date(stage.date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                            <p className="description">{stage.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineView;
