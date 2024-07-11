
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import { useProjects } from '../../hooks/useGetProjectsInfo';


export const HomePageEntery = () => {
    const { projects, loading, error } = useProjects();
    const navigate = useNavigate();
    const [expandedRows, setExpandedRows] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filter, setFilter] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: ''
    });

    const locations = [
        'North region',
        'South region',
        'central area', 
        'West region', 
        'East region', 
        'field of addictions', 
        'the field of young people and the homeless',
        'field of group work',
        'ultra-orthodox field',
        'national religious field',
        'Education, training and employment, media, response'
    ];


    useEffect(() => {
        applyFilter();
    }, [projects, filter]);




    const handleRowClick = (projectId) => {
        const isExpanded = expandedRows.includes(projectId);
        if (isExpanded) {
            setExpandedRows(expandedRows.filter(id => id !== projectId));
        } else {
            setExpandedRows([...expandedRows, projectId]);
        }
    };


    const handleSignIn = async () => {
        navigate('/signin');
        
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const applyFilter = () => {
        let filtered = projects;

        if (filter.name) {
            filtered = filtered.filter(project => project.projectTitle.toLowerCase().includes(filter.name.toLowerCase()));
        }
        if (filter.location) {
            filtered = filtered.filter(project => Array.isArray(project.location) && project.location.some(loc => loc.toLowerCase().includes(filter.location.toLowerCase())));
        }
        if (filter.startDate) {
            filtered = filtered.filter(project => new Date(project.startDate) >= new Date(filter.startDate));
        }
        if (filter.endDate) {
            filtered = filtered.filter(project => new Date(project.endDate) <= new Date(filter.endDate));
        }

        setFilteredProjects(filtered);
    };

    const renderLocations = (locations) => {
        if (locations && Array.isArray(locations)) {
            return (
                <div>
                    {locations.map((location, index) => (
                        <p key={index}>{location}</p>
                    ))}
                </div>
            );
        }
        return 'Locations are undefined or not an array'; // Or any default value you prefer when locations is undefined or not an array
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard">
            <header className="header">
                <div className="header-left">
                    <button>AR</button>
                    <button>Heb</button>
                </div>
                <div className="header-center">
                    <img src={logo} alt="Logo" className="logo" />
                    <button onClick={handleSignIn}>signIn</button>
                    
                </div>
            </header>
            <main className="main-content">
                <div className="filter-section">
                    <input
                        type="text"
                        name="name"
                        placeholder="Project Name"
                        value={filter.name}
                        onChange={handleFilterChange}
                    />
                    <select
                    name="location"
                    value={filter.location}
                    onChange={handleFilterChange}
                    >
                    <option value="">Select Location</option>
                        {locations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                    ))}
                    </select>

                    <input
                        type="date"
                        name="startDate"
                        value={filter.startDate}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filter.endDate}
                        onChange={handleFilterChange}
                    />
                    <button onClick={applyFilter}>Apply Filter</button>
                </div>
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Project Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Location</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project, index) => (
                            <React.Fragment key={project.id}>
                                <tr onClick={() => handleRowClick(project.id)}>
                                    <td>{index + 1}</td>
                                    <td>{project.projectTitle}</td>
                                    <td>{project.startDate}</td>
                                    <td>{project.endDate}</td>
                                    <td>{renderLocations(project.location)}</td> {/* Updated to show multiple locations */}
                                    <td>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</td> {/* Render the image */}

                                </tr>
                                {expandedRows.includes(project.id) && (
                                    <tr className="expanded-row">
                                        <td colSpan="6">
                                            <div className="expanded-content">
                                                <p><strong>Project Title:</strong> {project.projectTitle}</p>
                                                <p><strong>Start Date:</strong> {project.startDate}</p>
                                                <p><strong>End Date:</strong> {project.endDate}</p>
                                                <p><strong>Location:</strong> {renderLocations(project.location) }</p>
                                                <p><strong>Description:</strong> {project.description}</p>
                                                <p>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</p>
                                                <button onClick={handleSignIn}>To Regist</button>
                                                {/* Add more project details here */}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </main>
            <footer className="footer">
                <p>CONTACT US</p>
            </footer>
        </div>
    );
};

export default HomePageEntery;
