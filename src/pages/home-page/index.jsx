// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import './styles.css'; // Import CSS for styling
// import logo from '../../images/logo.png';
// import { useProjects } from '../../hooks/useGetProjectsInfo';

// export const HomePage = () => {
//     const { projects, loading, error } = useProjects();
//     const navigate = useNavigate();
//     const auth = getAuth();
//     const [authenticated, setAuthenticated] = useState(false);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setAuthenticated(true);
//             } else {
//                 navigate('/signin'); // Redirect to sign-in page if not authenticated
//             }
//         });

//         return () => unsubscribe();
//     }, [auth, navigate]);

//     if (!authenticated) {
//         return null; // Or a loading spinner while checking authentication
//     }

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>Error: {error}</div>;
//     }

//     return (
//         <div className="dashboard">
//             <header className="header">
//                 <div className="header-left">
//                     <button>AR</button>
//                     <button>Heb</button>
//                 </div>
//                 <div className="header-center">
//                     <img src={logo} alt="Logo" className="logo" />
//                     <button>sign in</button>
//                     <button>admin</button>
//                     <button>register worker</button>
//                 </div>
//                 <div className="header-right">
//                     <button>notify</button>
//                 </div>
//             </header>
//             <main className="main-content">
//                 <table className="projects-table">
//                     <thead>
//                         <tr>
//                             <th>#</th>
//                             <th>Project Name</th>
//                             <th>Start Date</th>
//                             <th>End Date</th>
//                             <th>Location</th>
//                             <th>Picture</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {projects.map((project, index) => (
//                             <tr key={project.id}>
//                                 <td>{index + 1}</td>
//                                 <td>{project.projectTitle}</td>
//                                 <td>{project.startDate}</td>
//                                 <td>{project.endDate}</td>
//                                 <td>{project.location}</td>
//                                 <td>
//                                     {project.imageUrl && <img src={project.imageUrl} alt={project.projectTitle} className="project-image" />}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </main>
//             <footer className="footer">
//                 <p>CONTACT US</p>
//             </footer>
//         </div>
//     );
// };

// export default HomePage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.png';
import { useProjects } from '../../hooks/useGetProjectsInfo';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase-config';

export const HomePage = () => {
    const { projects, loading, error } = useProjects();
    const navigate = useNavigate();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate('/signin'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const handleRowClick = (projectId) => {
        const isExpanded = expandedRows.includes(projectId);
        if (isExpanded) {
            setExpandedRows(expandedRows.filter(id => id !== projectId));
        } else {
            setExpandedRows([...expandedRows, projectId]);
        }
    };

    const handleEditProject = (projectId) => {
        navigate(`/editProject/${projectId}`);
    };

    const handleDeleteProject = async (projectId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (confirmDelete) {
            try {
                const docRef = doc(db, "projects", projectId);
                await deleteDoc(docRef);
                alert("Project deleted successfully.");
                // Refresh the page or remove the project from the state
                window.location.reload();
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert("Error deleting project. Please try again.");
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Error signing out. Please try again.");
        }
    };

    if (!authenticated) {
        return null; // Or a loading spinner while checking authentication
    }

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
                    <button onClick={handleSignOut}>Sign Out</button>
                    <button>Admin</button>
                    <button>Register Worker</button>
                </div>
                <div className="header-right">
                    <button>Notify</button>
                </div>
            </header>
            <main className="main-content">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Project Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Location</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project, index) => (
                            <React.Fragment key={project.id}>
                                <tr onClick={() => handleRowClick(project.id)}>
                                    <td>{index + 1}</td>
                                    <td>{project.projectTitle}</td>
                                    <td>{project.startDate}</td>
                                    <td>{project.endDate}</td>
                                    <td>{project.location}</td>
                                    <td>
                                        <button onClick={() => handleEditProject(project.id)}>Edit</button>
                                    </td>
                                    <td>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>Delete</button>
                                    </td>
                                </tr>
                                {expandedRows.includes(project.id) && (
                                    <tr className="expanded-row">
                                        <td colSpan="7">
                                            <div className="expanded-content">
                                                <p><strong>Description:</strong> {project.description}</p>
                                                <p><strong>Participants:</strong> {project.participants.join(', ')}</p>
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

export default HomePage;
