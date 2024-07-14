
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import { useProjects } from '../../hooks/useGetProjectsInfo';
import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase-config';
import profileIcon from '../../images/profileIcon.png';
import Modal from 'react-modal';
import { useRegister } from '../../hooks/useRegister';


Modal.setAppElement('#root');



const translations = {
    ar: {
        signOut: "تسجيل الخروج",
        registerAdmin: "تسجيل مشرف",
        registerWorker: "تسجيل عامل",
        addProject: "إضافة مشروع",
        users: "المستخدمين",
        notify: "إشعارات",
        filter: {
            projectName: "اسم المشروع",
            location: "الموقع",
            startDate: "تاريخ البدء",
            endDate: "تاريخ الانتهاء",
            image: "صورة",
            description: "الوصف",
            Workers: "مسؤلين المشورع",
            applyFilter: "بحث"
        },
        tableHeaders: {
            edit: "تعديل",
            delete: "حذف",
            print: "طباعة"
        },
        expandedContent: {
            projectTitle: "عنوان المشروع",
            startDate: "تاريخ البدء",
            endDate: "تاريخ الانتهاء",
            location: "الموقع",
            description: "الوصف",
            numberOfParticipants: "عدد المشاركين",
            participants: "المشاركون",
            register: "التسجيل في المشروع"
        },
        changeLanguage: "עברית",
        locations: [
            'منطقة الشمال',
            'منطقة الجنوب',
            'المنطقة المركزية',
            'منطقة الغرب',
            'منطقة الشرق',
            'مجال الإدمان',
            'مجال الشباب والمشردين',
            'مجال العمل الجماعي',
            'المجال الأرثوذكسي المتشدد',
            'المجال الديني الوطني',
            'التعليم والتدريب والتوظيف، الإعلام، الاستجابة'
        ]
    },
    heb: {
        signOut: "התנתק",
        registerAdmin: "רשום מנהל",
        registerWorker: "רשום עובד",
        addProject: "הוסף פרויקט",
        users: "משתמשים",
        notify: "עדכונים",
        filter: {
            projectName: "שם הפרויקט",
            location: "מקום",
            startDate: "תאריך התחלה",
            endDate: "תאריך סיום",
            image: "תמונה",
            description: "תיאור",
            Workers: "עובדים",
            applyFilter: "חיפוש"
        },
        tableHeaders: {
            image: "תמונה",
            edit: "עריכה",
            delete: "מחק",
            print: "הדפס"
        },
        expandedContent: {
            projectTitle: "כותרת הפרויקט",
            startDate: "תאריך התחלה",
            endDate: "תאריך סיום",
            location: "מיקום",
            description: "תיאור",
            numberOfParticipants: "מספר משתתפים",
            participants: "משתתפים",
            register: "הירשם לפרויקט"
        },
        changeLanguage: "العربية",
        locations: [
            'אזור הצפון',
            'אזור הדרום',
            'אזור המרכז',
            'אזור המערב',
            'אזור המזרח',
            'תחום ההתמכרויות',
            'תחום הצעירים והחסרי בית',
            'תחום העבודה הקבוצתית',
            'תחום האורתודוקסי',
            'תחום הדתי הלאומי',
            'חינוך, הכשרה ותעסוקה, מדיה, מענה'
        ]
    }
};



export const HomePage = () => {
    const { projects, loading, error } = useProjects();
    const navigate = useNavigate();
    const toGetAuth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const { registerUser } = useRegister();
    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: ''
        }
    );
    const [workersInfo, setWorkersInfo] = useState({});
    const [nameParticipants, setNameParticipants] = useState({});
    const [expandedRows, setExpandedRows] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filter, setFilter] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: ''
    });

    const [language, setLanguage] = useState('ar');
    const locations = translations[language].locations;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setAuthenticated(true);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserDetails({
                        userId: userData.id || '',
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        phoneNumber: userData.phoneNumber || '',
                        role: userData.role || '', // Set role
                        uid: user.uid // Set uid
                    });

                } else {
                    console.error('User document not found');
                }

            } else {
                navigate('/homePage'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        applyFilter();
    }, [projects, filter]);


    useEffect(() => {
        if (projects.length > 0) {
            fetchWorkersInfo();
        }
    }, [projects]);

    const fetchWorkersInfo = async () => {
        let info = {};
        let namesParticipants = {};
        for (const project of projects) {
            try {
                const { bool, participantIds = []} = await isWorker(project);
                info[project.id] = { bool, participantIds };
                
                // Fetch participant names and store in namesParticipants
                const participantNames = await getNameParticipant(project);
                namesParticipants[project.id] = participantNames; // Store names by project ID
            
            } catch (error) {
                console.error(`Error fetching workers info for project ${project.id}:`, error);
                info[project.id] = { bool: false, participantIds: [] };
                namesParticipants[project.id] = [];
            }
        }
        setWorkersInfo(info);
        setNameParticipants(namesParticipants);
    };
    


    const handleUserProfile = () => {
        navigate('/userProfile');
    };

    const handleAddProject = () => {
        navigate('/addProject');
    };

    const handleParticipant = () => {
        navigate('/participant');
    };

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

    const handleDeleteProject = async (projectId, projectTitle) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (confirmDelete) {
            try {
                // Delete the project document
                const projectDocRef = doc(db, "projects", projectId);
                await deleteDoc(projectDocRef);

                // Retrieve all users
                const usersSnapshot = await getDocs(collection(db, "users"));
                usersSnapshot.forEach(async (userDoc) => {
                    const userData = userDoc.data();
                    if (userData.projects && userData.projects.includes(projectTitle)) {
                        // Remove the project title from the user's projects array
                        console.log("deleted");
                        const userDocRef = doc(db, "users", userDoc.id);
                        await updateDoc(userDocRef, {
                            projects: arrayRemove(projectTitle)
                        });
                    } else {
                        console.log("not deleted");
                    }
                });

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
            await signOut(toGetAuth);
            navigate('/homePage');
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Error signing out. Please try again.");
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const handlePrint = () => {
        window.print();
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


    if (!authenticated) {
        return null; // Or a loading spinner while checking authentication
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    
    const isParticipant = (project) => {
        const currentUser = userDetails.firstName + " " + userDetails.lastName;
        if (currentUser && project.participants) {
            return project.participants.includes(currentUser);
        }
        return false;
      };
     

    const isWorker = async (project) => {
        let bool = false;
        let participantIds = [];
        if (project.participants && project.participants.length > 0) {
            for (const participantId of project.participants) {
                try {
                    const usersSnapshot = await getDocs(collection(db, "users"));
                    for (const userDoc of usersSnapshot.docs) {
                        const userData = userDoc.data();
                        const fullName = userData.firstName + " " + userData.lastName;
                        if (fullName === participantId) {
                            if (userData.role === 'Worker') {
                                bool = true;
                                participantIds.push(fullName);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching user data for participant ${participantId}:`, error);
                }
            }
        }
        return { bool, participantIds };
        
    };

    const getNameParticipant = async (project) => {
        
        let participantIds = [];
        if (project.participants && project.participants.length > 0) {
            for (const participantId of project.participants) {
                try {
                    const usersSnapshot = await getDocs(collection(db, "users"));
                    for (const userDoc of usersSnapshot.docs) {
                        const userData = userDoc.data();
                        const fullName = `${userData.firstName} ${userData.lastName}`;
                        if (fullName === participantId) {
                            participantIds.push(fullName);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching user data for participant ${participantId}:`, error);
                }
            }
        }
        return participantIds; // Or any default value you prefer when locations is undefined or not an array
    };

    const openModal = (userData) => {
        setSelectedUserData(userData);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserData(null);
    };


    const userInfo = async (name) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const dataName = `${userData.firstName} ${userData.lastName}`;
                if (dataName === name) {
                    openModal(userData);
                }
            }
        } catch (error) {
            console.error(`Error fetching user data for ${name}:`, error);
        }
    };
 
    
    const renderUserInfo = (userData) => {
        return (
            <div>
                <>
                    <p>UserName: {userData.username}</p>
                    <p>firstName: {userData.firstName}</p>
                    <p>LastName: {userData.lastName}</p>
                    <p>Email: {userData.email}</p>
                    <p>Role: {userData.role}</p>
                    <p>Phone: {userData.phoneNumber}</p>
                    <p>Address: {userData.location}</p>
                    <p>BirthDate: {userData.birthDate}</p>
                    <p>Gender: {userData.gender}</p>
                    <p>ID: {userData.id}</p>
                </>               
            </div>
        );
    };


    const handleRegisterAdmin = async () => {
        try {
            await registerUser(userDetails.userId, userDetails.firstName, userDetails.lastName, userDetails.role, userDetails.phoneNumber, "Admin", userDetails.uid);
            alert("Registration request for Admin submitted.");
        } catch (error) {
            alert("Error registering admin. Please try again.");
        }
    };

    const handleRegisterWorker = async () => {
        try {
            await registerUser(userDetails.userId, userDetails.firstName, userDetails.lastName, userDetails.role, userDetails.phoneNumber, "Worker", userDetails.uid);
            alert("Registration request for Worker submitted.");
        } catch (error) {
            console.error("Error registering worker:", error);
            alert("Error registering worker. Please try again.");
        }
    };

    const handleViewNotifications = () => {
        navigate('/notifications');
    };


    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };

    const t = translations[language];

    return (
        <>
            <div id="root"></div>
            <div className="dashboard">
                <header className="header">
                    <div className="header-left">
                        <button onClick={toggleLanguage}>{t.changeLanguage}</button>
                    </div>
                    <div className="header-center">
                        <img src={logo} alt="Logo" className="logo" />
                        <button onClick={handleSignOut}>{t.signOut}</button>
                        {userDetails.role === 'Worker' && (<button>{t.registerAdmin}</button>)}
                        {userDetails.role === 'Guest' && (
                            <>
                                 <button onClick={handleRegisterAdmin}>{t.registerAdmin}</button>
                                 <button onClick={handleRegisterWorker}>{t.registerWorker}</button>
                            </>
                        )}
                        <button onClick={handleUserProfile}>
                            <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                        </button>
                        {userDetails.role === "Admin" && (
                            <>
                                <button onClick={handleAddProject}>{t.addProject}</button>
                                <button onClick={handleParticipant}>{t.users}</button>
                            </>
                        )} 
                        <button onClick={handleViewNotifications}>{t.notify}</button> 
                    </div>
                </header>
                <main className="main-content">
                    <div className="filter-section">
                        <input
                            type="text"
                            name="name"
                            placeholder={t.filter.projectName}
                            value={filter.name}
                            onChange={handleFilterChange}
                        />
                        <select name="location" value={filter.location} onChange={handleFilterChange}>
                        <option value="">{t.filter.location}</option>
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
                            <button onClick={applyFilter}>{t.filter.applyFilter}</button>
                        </div>
                    <table className="projects-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{t.filter.projectName}</th>
                                <th>{t.filter.startDate}</th>
                                <th>{t.filter.endDate}</th>
                                <th>{t.filter.location}</th>
                                <th>{t.filter.description}</th>
                                <th>{t.filter.Workers}</th>
                                <th>{t.filter.image}</th>
                                {(userDetails.role === 'Admin' || userDetails.role === 'Worker') && (
                                <>
                                     <th>{t.tableHeaders.edit}</th>
                                     <th>{t.tableHeaders.delete}</th>
                                </>
                            )}                
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
                                        <td>{project.description}</td>
                                        <td>
                                            {workersInfo[project.id] ? (
                                                workersInfo[project.id].bool ? (
                                                    <div>
                                                        {workersInfo[project.id].participantIds.map((id, index) => (
                                                            <div key={index}>{id}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span>No Worker</span>
                                                )
                                            ) : (
                                                <span>Loading...</span>
                                            )}
                                        </td>
                                        <td>
                                            {project.imageUrl ? ( 
                                                <img src={project.imageUrl} alt="Project" className="project-image" />
                                            ) : ( 
                                                'No Image'
                                            )}
                                        </td> 
                                        {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                                        <>
                                            <td>
                                                <button onClick={() => handleEditProject(project.id)}>{t.tableHeaders.edit}</button>
                                            </td>
                                            <td>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.projectTitle); }}>{t.tableHeaders.delete}</button>
                                            </td>
                                        </>
                                    )}
                                    </tr>
                                    {expandedRows.includes(project.id) && (
                                        <tr className="expanded-row">
                                            <td colSpan="10">
                                                <div className="expanded-content">
                                                    <p><strong>{t.expandedContent.projectTitle}:</strong> {project.projectTitle}</p>
                                                    <p><strong>{t.expandedContent.startDate}:</strong> {project.startDate}</p>
                                                    <p><strong>{t.expandedContent.endDate}:</strong> {project.endDate}</p>
                                                    <p><strong>{t.expandedContent.location}:</strong> {renderLocations(project.location) }</p>
                                                    <p><strong>{t.expandedContent.description}:</strong> {project.description}</p>
                                                    {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                                                        <>
                                                            <p><strong>{t.expandedContent.numberOfParticipants}:</strong> {project.participants.length}</p>
                                                            <p>
                                                                <strong>{t.expandedContent.participants}:</strong>
                                                                {nameParticipants[project.id] ? (
                                                                    <div>
                                                                        {nameParticipants[project.id].map((name, index) => (
                                                                            <button key={index} onClick={() => userInfo(name)} > {name}</button>
                                                                        ))}
                                                                    </div>
                                                                ):(
                                                                    <span>Loading...</span>
                                                                )
                                                            }
                                                            </p>
                                                        </>
                                                    )}
                                                    <Modal
                                                        isOpen={modalIsOpen}
                                                        onRequestClose={closeModal}
                                                        contentLabel="User Information"
                                                    >
                                                        {selectedUserData && renderUserInfo(selectedUserData)}
                                                        <button onClick={closeModal}>Close</button>
                                                    </Modal>                             
                                                    <p>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</p>
                                                    {((userDetails.role === 'Worker' && !isParticipant(project) )|| (userDetails.role === 'Guest')) && (
                                                        <button>{t.expandedContent.register}</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <div className="action-buttons">
                        <button onClick={handlePrint}>{t.tableHeaders.print}</button>
                    </div>
                </main>
                <footer className="footer">
                    <p>CONTACT US</p>
                </footer>
            </div>
        </>
    );
};

export default HomePage;
