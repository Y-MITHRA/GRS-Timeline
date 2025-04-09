import React, { useState, useEffect } from "react";
import Footer from "../shared/Footer";
import NavBar from "../components/NavBar";
import AdminSidebar from '../components/AdminSidebar';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import { Bell, User, ChevronDown, Plus, MessageSquare, List, X, Database } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [resourceData, setResourceData] = useState([]);
    const [resourceLoading, setResourceLoading] = useState(true);
    const [resourceError, setResourceError] = useState(null);

    // Mock statistics
    const quickStats = [
        { title: "Total Cases", value: "2,451", trend: "+12%" },
        { title: "Active Cases", value: "342", trend: "+5%" },
        { title: "Cases Resolved", value: "1,887", trend: "+8%" },
        { title: "Departments", value: "15", trend: "Stable" },
    ];

    // Mock department performance data
    const departmentData = [
        { name: "Water", resolved: 45 },
        { name: "RTO", resolved: 30 },
        { name: "Electricity", resolved: 55 },
        { name: "Hospital", resolved: 25 },
        { name: "Road", resolved: 35 },
    ];

    // Mock monthly trends data
    const monthlyTrends = [
        { month: "Jan", cases: 65 },
        { month: "Feb", cases: 75 },
        { month: "Mar", cases: 55 },
        { month: "Apr", cases: 85 },
        { month: "May", cases: 95 },
        { month: "Jun", cases: 75 },
    ];

    // Mock cases data
    const cases = [
        {
            id: "CASE-001",
            title: "Water Supply Issue",
            department: "Water",
            assignedTo: "John Smith",
            status: "In Progress",
            priority: "High",
            lastUpdated: "2024-02-22",
        },
        {
            id: "CASE-002",
            title: "Road Maintenance",
            department: "Road",
            assignedTo: "Sarah Johnson",
            status: "Pending",
            priority: "Medium",
            lastUpdated: "2024-02-21",
        },
    ];

    useEffect(() => {
        fetchResourceData();
    }, []);

    const fetchResourceData = async () => {
        try {
            setResourceLoading(true);
            setResourceError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/api/admin/resource-management', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch resource data');
            }

            const data = await response.json();
            setResourceData(data.resources);
        } catch (error) {
            console.error('Error fetching resource data:', error);
            setResourceError('Failed to load resource data');
        } finally {
            setResourceLoading(false);
        }
    };

    return (
        <div className="d-flex">
            <AdminSidebar />
            <div className="flex-grow-1">
                <NavBar />
                <Container fluid className="py-3">
                    <Row className="mb-4">
                        <Col>
                            <h2>Admin Dashboard</h2>
                            <p className="text-muted">Welcome to the admin dashboard</p>
                        </Col>
                    </Row>

                    {/* Top Navbar */}
                    <div className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm mb-3">
                        <h4>Dashboard</h4>
                        <div className="d-flex align-items-center">
                            <Button variant="light" className="me-3 position-relative">
                                <Bell size={20} />
                                <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">3</span>
                            </Button>
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary text-white p-2 me-2">A</div>
                                <span>Admin</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <Row className="mb-4">
                        {quickStats.map((stat, index) => (
                            <Col md={3} key={index}>
                                <Card className="p-3 shadow-sm">
                                    <h6 className="text-muted">{stat.title}</h6>
                                    <h4>{stat.value}</h4>
                                    <span className={`text-${stat.trend.includes("+") ? "success" : "muted"}`}>{stat.trend}</span>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Charts */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="p-3 shadow-sm">
                                <h6>Department Performance</h6>
                                <BarChart width={400} height={250} data={departmentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="resolved" fill="#007bff" />
                                </BarChart>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="p-3 shadow-sm">
                                <h6>Monthly Trends</h6>
                                <LineChart width={400} height={250} data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="cases" stroke="#28a745" />
                                </LineChart>
                            </Card>
                        </Col>
                    </Row>

                    {/* Cases Table */}
                    

                    {/* Resource Management Section */}
                    <Card className="shadow-sm mt-4">
                        <Card.Header>
                            <h6>Department Resource Management</h6>
                        </Card.Header>
                        <Card.Body>
                            {resourceLoading ? (
                                <div className="text-center">Loading resource data...</div>
                            ) : resourceError ? (
                                <div className="text-danger">{resourceError}</div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Grievance ID</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Requirements</th>
                                            <th>Funds Required</th>
                                            <th>Resources</th>
                                            <th>Manpower</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resourceData.map((resource) => (
                                            <tr key={resource._id}>
                                                <td>{resource.department}</td>
                                                <td className="text-primary">{resource.grievanceId}</td>
                                                <td>{new Date(resource.startDate).toLocaleDateString()}</td>
                                                <td>{new Date(resource.endDate).toLocaleDateString()}</td>
                                                <td>{resource.requirementsNeeded}</td>
                                                <td>₹{resource.fundsRequired}</td>
                                                <td>{resource.resourcesRequired}</td>
                                                <td>{resource.manpowerNeeded}</td>
                                                <td>
                                                    <span className={`badge bg-${resource.status === 'Completed' ? 'success' : 'warning'}`}>
                                                        {resource.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        </div>
    );
};

export default AdminDashboard;
