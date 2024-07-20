
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase-config';
import profileIcon from '../../images/profileIcon.png';
import Modal from 'react-modal';
import { useRegister } from '../../hooks/useRegister';
import { getStorage, ref, deleteObject } from 'firebase/storage';


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
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifies, setNotifies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const { registerUser } = useRegister();
    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: '',
        username: '',
        projects: []
        }
    );
    const [workersInfo, setWorkersInfo] = useState({});
    const [nameParticipants, setNameParticipants] = useState({});
    const [expandedRows, setExpandedRows] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [filter, setFilter] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: ''
    });

    const [language, setLanguage] = useState('ar');
    const locations = translations[language].locations;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const user = toGetAuth.currentUser;
            if (user) {
                setAuthenticated(true);
                try {
                    const [userDoc, projectDocs, usersDocs, registProject] = await Promise.all([
                        getDoc(doc(db, 'users', user.uid)),
                        getDocs(collection(db, 'projects')),
                        getDocs(collection(db, 'users')),
                        getDocs(collection(db,'projectsRegisters'))
                    ]);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserDetails({
                            userId: userData.id || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            phoneNumber: userData.phoneNumber || '',
                            role: userData.role || '', // Set role
                            uid: user.uid, // Set uid
                            username: userData.username || '',
                            projects: userData.projects || []
                        });
                    } else {
                        console.error('User document not found');
                    }

                    const projectsList = [];
                    projectDocs.forEach((doc) => {
                        projectsList.push({ id: doc.id, ...doc.data() });
                    });

                    const usersList = [];
                    
                    usersDocs.forEach((userDoc) => {
                       usersList.push({ id: userDoc.id, ...userDoc.data() });
                    });

                    const registProjects = [];
                    registProject.forEach((registDoc) => {
                        registProjects.push({ id: registDoc.id, ...registDoc.data() });
                    });

                    const workersInfo = {};
                    const nameParticipants = {};

                    projectsList.forEach((project) => {
                        const workerParticipants = [];
                        const participantNames = [];

                        if (project.participants && project.participants.length > 0) {
                            project.participants.forEach((fullName) => {
                            participantNames.push(fullName);
                            usersList.forEach((user) => {
                                const userFullName = user.firstName + ' ' + user.lastName;
                                if (userFullName === fullName) {
                                    if (user.role === 'Worker') {
                                        workerParticipants.push(fullName);
                                    }
                                }
                            });
                        })

                        workersInfo[project.id] = { bool: workerParticipants.length > 0, participantIds: workerParticipants };
                        nameParticipants[project.id] = participantNames;
                           
                    }
                    });

                    setProjects(projectsList);
                    setUsers(usersList);
                    setWorkersInfo(workersInfo);
                    setNameParticipants(nameParticipants);
                    setNotifies(registProjects)
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            } else {
                navigate('/homePage'); 
            }
            setLoading(false);
        };

        
        const unsubscribe = auth.onAuthStateChanged(() => {
            fetchData();
        });

        return () => unsubscribe();
    }, [navigate, toGetAuth]);

    useEffect(() => {
        applyFilter();
    }, [projects, filter, isFilterApplied]);

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
                setLoading(true);
                const storage = getStorage();

                const deleteImagePromises = projects.map(async (project) => {
                    if (project.id === projectId) {
                        const imageFileName = project.imageName;
                        if (imageFileName) {
                            const imageRef = ref(storage, `images/${projectTitle}/${imageFileName}`);
                            await deleteObject(imageRef);
                        }
                    }
                });
    
                await Promise.all(deleteImagePromises);
    
                const projectDocRef = doc(db, "projects", projectId);
                await deleteDoc(projectDocRef);
    
                const updateUserProjectsPromises = users.map(async (user) => {
                    if (user.projects && user.projects.includes(projectTitle)) {
                        const userDocRef = doc(db, "users", user.uid);
                        await updateDoc(userDocRef, {
                            projects: arrayRemove(projectTitle)
                        });
                    }
                });
    
                await Promise.all(updateUserProjectsPromises);
    
                alert("Project deleted successfully.");
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert("Error deleting project. Please try again.");
            } finally {
                setLoading(false);
                window.location.reload(); // Refresh the page after all operations are complete
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

    const projectFilterUser = () => {
        setIsFilterApplied(!isFilterApplied);
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

        if (isFilterApplied) {
            const userFullName = `${userDetails.firstName} ${userDetails.lastName}`;
    
            filtered = filtered.filter(project => {
                const projectIncluded = userDetails.projects.includes(project.projectTitle);
                const userIncluded = project.participants.includes(userFullName);
                return projectIncluded && userIncluded;
            });
        }
        setFilteredProjects(filtered);
    };

    const clearFilter = () => {
        setFilter({
            name: "",
            location: "",
            startDate: "",
            endDate: ""
        });
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

    const isParticipant = (project) => {
        const currentUser = `${userDetails.firstName} ${userDetails.lastName}`;
        if (currentUser && project.participants) {
            return project.participants.includes(currentUser);
        }
        return false;
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
            
            for (const user of users) {
                
                const dataName = `${user.firstName} ${user.lastName}`;
                if (dataName === name) {
                    openModal(user);
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

    const handleAddNotification = async(project, isAdmin) => {
        
        const adminsList = [];
        const workerList = [];
        if (isAdmin){   
            project.participants.forEach((participantName) => {
                users.forEach((user) => {
                    const userFullName = `${user.firstName} ${user.lastName}`;
                    if (userFullName === participantName)
                        if (user.role === "Admin")
                            adminsList.push(user.uid);
                })
            })
            console.log("adminsList: ", adminsList);
        }else{
            workersInfo[project.id].participantIds.forEach((participantName) => {
                users.forEach((user) => {
                    const userFullName = `${user.firstName} ${user.lastName}`;
                    if (userFullName === participantName)
                        workerList.push(user.uid);
                })
            })
        }
        console.log("workerList: ", workerList);
        await addDoc(collection(db, "projectsRegisters"), {
            workerID:(!isAdmin) ? (workerList):(adminsList),
            projectId: project.id,
            userId: userDetails.uid,
        });

        setNotifies(prevNotify => ({
            ...prevNotify,
            [project.id]: [
                ...(prevNotify[project.id] || []),
                {
                    workerID: (!isAdmin) ? (workerList):(adminsList),
                    projectId: project.id,
                    userId: userDetails.uid,
                }
            ]
        })); 
        
        
    };

    const rendersWorkersSpecificProject = (projectId) => {
        if (workersInfo[projectId].bool){
            return (
                <div>
                    {workersInfo[projectId].participantIds.map((name, index) => (
                        <button key={index} onClick={() => userInfo(name)} > {name}</button>
                    ))}
                </div>
            )
        }
        return (
            <p>No Workers</p>
        )
    }

    const handleSendRegistProject = async (project) =>{
        console.log("notifies: ", notifies);
        let notification = {};
        
        
        const confirmRegist = window.confirm("Are you sure you want to regist to this project?");    
        if (confirmRegist){
            console.log("notifies: ", notifies);
            if (workersInfo[project.id].bool){
                console.log("workerParticipant: ", workersInfo[project.id].participantIds)
                try{
                    if (notifies){
                        for (notification of notifies){
                            console.log("notification: ", notification);
                            if (notification.projectId === project.id && notification.userId === userDetails.uid){
                                alert ("Notification already sent to this worker.");
                                return;
                            }
                        }
                    }
                    await handleAddNotification(project, false);
                    // console.log("afterNotifies: ", notifies); 
                    window.location.reload();
                }catch(error){
                    console.log("Error adding project register: ", error);
                }
            }else{
                console.log("admin");
                await handleAddNotification(project, true);
            }
        }
    }

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };
  
    if (!authenticated) {
        return null; 
    }

    if (loading) {
        return <div>Loading...</div>;
    }

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
                        <p><strong>{userDetails.username}</strong></p>
                        <button onClick={handleSignOut}>{t.signOut}</button>
                        {userDetails.role === 'Worker' && (<button onClick={handleRegisterAdmin}>{t.registerAdmin}</button>)}
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
                        {(userDetails.role === "Worker" || userDetails.role === "Admin") && (
                            <button onClick={handleViewNotifications}>{t.notify}</button>
                        )}
                    </div>
                </header>
                <main className="main-content">
                    <div className="filter-section">
                        <input
                            type="text"
                            name="name"
                            placeholder={t.filter.projectName}
                            value={filter.name}
                            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                        />
                        <select name="location" value={filter.location} onChange={(e) => setFilter({ ...filter, location: e.target.value })}>
                            <option value="">{t.filter.location}</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="startDate"
                            value={filter.startDate}
                            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={filter.endDate}
                            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                        />
                        <button onClick={clearFilter}>Clear Filter</button>
                        <button type="button" onClick={projectFilterUser}>
                            {isFilterApplied ? "Clear Filter Projects" : "My Projects"}
                        </button>
                        
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
                                                    <p><strong>{t.expandedContent.location}:</strong> {renderLocations(project.location)}</p>
                                                    <p><strong>{t.expandedContent.description}:</strong> {project.description}</p>
                                                    {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                                                        <>
                                                            <p><strong>{t.expandedContent.numberOfParticipants}:</strong> {project.participants ? project.participants.length : 0}</p>
                                                            <p>
                                                                <strong>{t.expandedContent.participants}:</strong>

                                                                {nameParticipants[project.id] ? (
                                                                    <div>
                                                                        {nameParticipants[project.id].map((name, index) => (
                                                                            <button key={index} onClick={() => userInfo(name)} > {name}</button>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span>Loading...</span>
                                                                )}
                                                            </p>
                                                        </>
                                                    )}
                                                    {((userDetails.role === 'Guest' || (userDetails.role === 'Worker' && !isParticipant(project))) && rendersWorkersSpecificProject(project.id))}
                                                    <Modal
                                                        isOpen={modalIsOpen}
                                                        onRequestClose={closeModal}
                                                        contentLabel="User Information"
                                                    >
                                                        {selectedUserData && renderUserInfo(selectedUserData)}
                                                        <button onClick={closeModal}>Close</button>
                                                    </Modal>
                                                    <p>{project.imageUrl ? <img src={project.imageUrl} alt="Project" className="project-image" /> : 'No Image'}</p>
                                                    {((userDetails.role === 'Worker' && !isParticipant(project)) || (userDetails.role === 'Guest' && !isParticipant(project))) && (
                                                        <button onClick={() => handleSendRegistProject(project)}>{t.expandedContent.register}</button>
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
