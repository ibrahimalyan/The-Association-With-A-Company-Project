import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import profileIcon from '../../images/profileIcon.png';
import Modal from 'react-modal';
import { useRegister } from '../../hooks/useRegister';
import { useFirebase } from '../../hooks/FirebaseContext';

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
    const navigate = useNavigate();
    const toGetAuth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const { registerUser } = useRegister();
    const [projects, setProjects] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [workersInfo, setWorkersInfo] = useState({});
    const [nameParticipants, setNameParticipants] = useState({});
    const [expandedRows, setExpandedRows] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [roleUserData, setRoleUserData] = useState(null); // State to store the role
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [filter, setFilter] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: ''
    });
    const [language, setLanguage] = useState('ar');
    const locations = translations[language].locations;

    const { getProjects, deleteProjects, getUsers } = useFirebase();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(toGetAuth, async (user) => {
            if (user) {
                setAuthenticated(true);
                const users = await getUsers();
                const currentUser = users.find(u => u.uid === user.uid);
                setUserDetails(currentUser);
                const getAllProjects = await getProjects();
                setProjects(getAllProjects);
            } else {
                navigate('/homePage');
            }
        });

        return () => unsubscribe();
    }, [toGetAuth, navigate, getUsers]);

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
                const { bool, participantIds = [] } = await isWorker(project);
                info[project.id] = { bool, participantIds };

                const participantNames = await getNameParticipant(project);
                namesParticipants[project.id] = participantNames;

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

    const handleAddProjectPage = () => {
        navigate('/addProject');
    };

    const usersPage = () => {
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
                console.log(projects);
                const project = projects.find(p => p.id === projectId);
                await deleteProjects(project);
                alert("Project deleted successfully.");
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

    const applyFilter = async () => {
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

    if (!authenticated || !userDetails) {
        return null; // Or a loading spinner while checking authentication
    }

    const isParticipant = (project) => {
        const currentUser = `${userDetails.firstName} ${userDetails.lastName}`;
        if (currentUser && project.participants) {
            return project.participants.includes(currentUser);
        }
        return false;
    };

    const isWorker = async (project) => {
        let bool = false;
        let participantIds = [];
        if (project.participants && project.participants.length > 0) {
            const users = await getUsers();
            for (const participantId of project.participants) {
                try {
                    for (const user of users) {
                        const fullName = `${user.firstName} ${user.lastName}`;
                        if (fullName === participantId) {
                            if (user.role === 'Worker') {
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
            const users = await getUsers();
            for (const participantId of project.participants) {
                try {
                    for (const user of users) {
                        const fullName = `${user.firstName} ${user.lastName}`;
                        if (fullName === participantId) {
                            participantIds.push(fullName);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching user data for participant ${participantId}:`, error);
                }
            }
        }
        return participantIds;
    };

    const openModal = (userData) => {
        
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserData(null);
    };

    const userInfo = async (name) => {
        try {
            console.log("userInfo: ", name);
            const users = await getUsers();
            const user = users.find(user => `${user.firstName} ${user.lastName}` === name);
            if (user) {
                
                setSelectedUserData(user);
                
                    
                    openModal(user);
                
                
            }
        } catch (error) {
            console.error(`Error fetching user data for ${name}:`, error);
        }
    };

    

    const renderUserInfo = (userData) => {
        return (
            <div>
                <>
                    <table>
                        <thead>
                            <tr>
                                
                                <th>UserName</th>
                                <th>firstName</th>
                                <th>LastName</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>BirthDate</th>
                                <th>Gender</th>
                                <th>ID</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{userData.username}</td>
                                <td>{userData.firstName}</td>
                                <td>{userData.lastName}</td>
                                <td>{userData.role}</td>
                                <td>{userData.phoneNumber}</td>
                                <td>{userData.location}</td>
                                <td>{userData.birthDate}</td>
                                <td>{userData.gender}</td>
                                <td>{userData.id}</td>
                                <td>{userData.email}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            </div>
        );
    };

    const renderSpecificProject = (project) => {
        return (
            <div>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>{t.expandedContent.projectTitle}</th>
                            <th>{t.expandedContent.startDate}</th>
                            <th>{t.expandedContent.endDate}</th>
                            <th>{t.expandedContent.location}</th>
                            <th>{t.expandedContent.description}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="5">
                                <td>{project.projectTitle}</td>
                                <td>{project.startDate}</td>
                                <td>{project.endDate}</td>
                                <td>{renderLocations(project.locations)}</td>
                                <td>{project.description}</td>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                    <>
                        <p><strong>{t.expandedContent.numberOfParticipants}:</strong> {project.participants.length}</p>
                        <p>
                            <strong>{t.expandedContent.participants}:</strong>
                            <table className='participants-table' >
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>User</th>           
                                                </tr>
                                            </thead>
                                            {nameParticipants[project.id] ? (
                                            <div>
                                            {nameParticipants[project.id].map((name, index) => (
                                                <tbody>
                                                    <tr>
                                                        <td>{index +1}</td>
                                                        <button key={index} onClick={() => userInfo(name)}>{name}</button>          
                                                    </tr>
                                                </tbody>
                                            ))}
                                    </div>
                            ) : (
                                <span>Loading...</span>
                            )}
                            </table>
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
                {((userDetails.role === 'Worker' && !isParticipant(project)) || (userDetails.role === 'Guest')) && (
                    <button>{t.expandedContent.register}</button>
                )}
            </div>
        )
    }

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
                                <button onClick={handleAddProjectPage}>{t.addProject}</button>
                                <button onClick={usersPage}>{t.users}</button>
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
                                        <td>{renderLocations(project.locations)}</td>
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
                                                    
                                                {renderSpecificProject(project)}
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


