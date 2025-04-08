import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../shared/Footer";
import NavBar from "../components/NavBar";
import { Plus, Search, Filter, RefreshCw, Eye, MessageCircle, AlertCircle, Clock } from "lucide-react";
import moment from 'moment';
import ChatComponent from '../components/ChatComponent';
import TimelineView from '../components/TimelineView';
import "../styles/Chat.css";

const PetitionerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, authenticatedFetch } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [message, setMessage] = useState(location.state?.message || null);
    const [messageType] = useState(location.state?.type || 'info');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    });
    const [activeTab, setActiveTab] = useState('all');
    const [filteredGrievances, setFilteredGrievances] = useState([]);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);

    useEffect(() => {
        fetchGrievances();
        // Clear location state after showing message
        if (location.state?.message) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    useEffect(() => {
        const filtered = grievances.filter(grievance =>
            grievance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grievance.grievanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grievance.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGrievances(filtered);
    }, [searchTerm, grievances]);

    const fetchGrievances = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await authenticatedFetch(`http://localhost:5000/api/grievances/user/${user.id}`);
            const data = await response.json();

            if (response.ok) {
                // Transform the data to match the expected format
                const transformedGrievances = data.grievances.map(grievance => ({
                    ...grievance,
                    grievanceId: grievance.petitionId || grievance.grievanceId, // Use petitionId if available, fallback to grievanceId
                    submittedDate: grievance.createdAt,
                    lastUpdated: grievance.updatedAt,
                    assignedTo: grievance.assignedTo || null // Ensure assignedTo is properly handled
                }));

                // Filter based on active tab
                const filteredGrievances = activeTab === 'all'
                    ? transformedGrievances
                    : transformedGrievances.filter(g => g.status === activeTab);

                setGrievances(filteredGrievances);

                // Calculate stats
                const stats = {
                    total: transformedGrievances.length,
                    pending: transformedGrievances.filter(g => g.status === 'pending').length,
                    inProgress: transformedGrievances.filter(g => g.status === 'in-progress').length,
                    resolved: transformedGrievances.filter(g => g.status === 'resolved').length
                };
                setStats(stats);
            } else {
                setError(data.error || 'Failed to fetch grievances');
            }
        } catch (error) {
            console.error('Error fetching grievances:', error);
            if (error.message === 'No authentication token available') {
                setError('Your session has expired. Please log in again.');
                setTimeout(() => {
                    navigate('/login/petitioner');
                }, 2000);
            } else {
                setError('Failed to fetch grievances. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchGrievances();
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-warning';
            case 'in-progress':
                return 'bg-primary';
            case 'resolved':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const handleViewDetails = (grievanceId) => {
        navigate(`/grievance/${grievanceId}`);
    };

    const handleViewChat = (grievance) => {
        setSelectedGrievance(grievance);
        setShowChat(true);
    };

    return (
        <>
            <NavBar />
            <div className="container-fluid py-4">
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">My Grievances</h2>
                    <button
                        className="btn btn-primary d-flex align-items-center"
                        onClick={() => navigate("/submit-grievance")}
                    >
                        <Plus size={18} className="me-2" />
                        Submit New Grievance
                    </button>
                </div>

                {/* Alert Message */}
                {message && (
                    <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
                        {message}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setMessage(null)}
                        ></button>
                    </div>
                )}

                {/* Stats Section */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h5 className="card-title">Total Grievances</h5>
                                <h2 className="card-text">{stats.total}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-dark">
                            <div className="card-body">
                                <h5 className="card-title">Pending</h5>
                                <h2 className="card-text">{stats.pending}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h5 className="card-title">In Progress</h5>
                                <h2 className="card-text">{stats.inProgress}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h5 className="card-title">Resolved</h5>
                                <h2 className="card-text">{stats.resolved}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="btn-group" role="group">
                            <button
                                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </button>
                            <button
                                className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending
                            </button>
                            <button
                                className={`btn ${activeTab === 'in-progress' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('in-progress')}
                            >
                                In Progress
                            </button>
                            <button
                                className={`btn ${activeTab === 'resolved' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setActiveTab('resolved')}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search grievances..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-outline-secondary" type="button">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        <AlertCircle className="me-2" size={20} />
                        {error}
                    </div>
                )}

                {/* Grievances Table */}
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Grievance ID</th>
                                <th>Title</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Submitted Date</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredGrievances.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        No grievances found
                                    </td>
                                </tr>
                            ) : (
                                filteredGrievances.map((grievance) => (
                                    <tr key={grievance._id}>
                                        <td>{grievance.grievanceId || 'N/A'}</td>
                                        <td>{grievance.title}</td>
                                        <td>{grievance.department}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(grievance.status)}`}>
                                                {grievance.status}
                                            </span>
                                        </td>
                                        <td>
                                            {grievance.assignedTo ?
                                                `${grievance.assignedTo.firstName} ${grievance.assignedTo.lastName}` :
                                                'Not Assigned'
                                            }
                                        </td>
                                        <td>{moment(grievance.createdAt).format('MMM D, YYYY')}</td>
                                        <td>{moment(grievance.updatedAt).format('MMM D, YYYY')}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {grievance.assignedTo && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleViewChat(grievance)}
                                                    >
                                                        <MessageCircle size={16} className="me-1" />
                                                        Chat
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() => {
                                                        setSelectedGrievance(grievance);
                                                        setShowTimeline(true);
                                                    }}
                                                >
                                                    <Clock size={16} className="me-1" />
                                                    Timeline
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Timeline Modal */}
                {showTimeline && selectedGrievance && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Timeline - Grievance {selectedGrievance.grievanceId}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowTimeline(false);
                                            setSelectedGrievance(null);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <TimelineView grievanceId={selectedGrievance._id} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Modal */}
                {showChat && selectedGrievance && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Chat - Grievance {selectedGrievance.grievanceId}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowChat(false);
                                            setSelectedGrievance(null);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body" style={{ height: '500px', padding: 0 }}>
                                    <ChatComponent 
                                        grievanceId={selectedGrievance._id}
                                        petitionerId={selectedGrievance.petitioner?._id || selectedGrievance.petitioner}
                                        officialId={selectedGrievance.assignedOfficials?.[0]?._id || selectedGrievance.assignedOfficials?.[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default PetitionerDashboard;
