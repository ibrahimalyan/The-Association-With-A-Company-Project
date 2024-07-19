
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import { useProjects } from '../../hooks/useGetProjectsInfo';
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
        username: ''
        }
    );
    const [workersInfo, setWorkersInfo] = useState({});
    const [nameParticipants, setNameParticipants] = useState({});
    // const [expandedRows, setExpandedRows] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // State to track modal type (user or project)
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
                            username: userData.username || ''
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
    }, [projects, filter]);

    const handleUserProfile = () => {
        navigate('/userProfile');
    };

    const handleAddProject = () => {
        navigate('/addProject');
    };

    const handleParticipant = () => {
        navigate('/participant');
    };

    // const handleRowClick = (projectId) => {
    //     const isExpanded = expandedRows.includes(projectId);
    //     if (isExpanded) {
    //         setExpandedRows(expandedRows.filter(id => id !== projectId));
    //     } else {
    //         setExpandedRows([...expandedRows, projectId]);
    //     }
    // };

    const handleEditProject = (projectId) => {
        navigate(`/editProject/${projectId}`);
    };

    const handleDeleteProject = async (projectId, projectTitle) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (confirmDelete) {
            try {
                console.log("projects", projects);
                const storage = getStorage();
                projects.forEach(async (project) => {
                    if (project.id === projectId) {
                        const imageFileName = project.imageName;
                        console.log("imageFileName", imageFileName , "\nprojectTitle", projectTitle);
                        if (imageFileName) {
                            const imageRef = ref(storage, `images/${projectTitle}/${imageFileName}`);
                            await deleteObject(imageRef);
                        }
                    }
                });
                // Delete the project document
                const projectDocRef = doc(db, "projects", projectId);
                await deleteDoc(projectDocRef);

                // Retrieve all users
                // const usersSnapshot = await getDocs(collection(db, "users"));
                users.forEach(async (user) => {
                    
                    if (user.projects && user.projects.includes(projectTitle)) {
                        // Remove the project title from the user's projects array
                        console.log("deleted");
                        const userDocRef = doc(db, "users", user.id);
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
    
    const isParticipant = (project) => {
        const currentUser = `${userDetails.firstName} ${userDetails.lastName}`;
        if (currentUser && project.participants) {
            return project.participants.includes(currentUser);
        }
        return false;
    };
 

    const openUserModal = (userData) => {
        setSelectedUserData(userData);
        setModalType('user');
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setModalType(null);
    };

    const openProjectModal = (project) => {
        setSelectedUserData(project);
        setModalType('project');
        setModalIsOpen(true);
    };

    const userInfo = async (name) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const dataName = `${userData.firstName} ${userData.lastName}`;
                if (dataName === name) {
                    openUserModal(userData);
                }
            }
        } catch (error) {
            console.error(`Error fetching user data for ${name}:`, error);
        }
    };
 
    
    const renderUserInfo = (userData) => {
        if (!selectedUserData) return null;

        return (
            <div className="modaluser-content">
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

    const renderProjectInfo = (project) => {
        if (!project) return null;
        return (
                            <div className="expanded-content">
                                        <p>
                                            <strong>{t.expandedContent.projectTitle}:</strong> {project.projectTitle}
                                        </p>
                                        <p>
                                            <strong>{t.expandedContent.startDate}:</strong> {project.startDate}
                                        </p>
                                        <p>
                                            <strong>{t.expandedContent.endDate}:</strong> {project.endDate}
                                        </p>
                                        <p>
                                            <strong>{t.expandedContent.location}:</strong> {renderLocations(project.location)}
                                        </p>
                                        <p>
                                            <strong>{t.expandedContent.description}:</strong> {project.description}
                                        </p>
                                        {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                                            <>
                                                <p>
                                                    <strong>{t.expandedContent.numberOfParticipants}:</strong> {project.participants.length}
                                                </p>
                                                <p>
                                                    <strong>{t.expandedContent.participants}:</strong>
                                                    {nameParticipants[project.id] ? (
                                                        <div>
                                                            {nameParticipants[project.id].map((name, index) => (
                                                                <button key={index} onClick={() => userInfo(name)}>
                                                                    {name}
                                                                </button>
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
                                        //  isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="User Information"
                                         >
                                         {
                                         modalType === 'user' &&
                                          selectedUserData &&
                                          renderUserInfo(selectedUserData)}
                                         <button onClick={closeModal}>Close</button>
                                     </Modal>   
                                        <p>
                                            {project.imageUrl ? (
                                                <img src={project.imageUrl} alt="Project" className="project-image" />
                                            ) : (
                                                'No Image'
                                            )}
                                        </p>
                                        {((userDetails.role === 'Worker' && !isParticipant(project)) || userDetails.role === 'Guest') && (
                                            <button onClick={() => handleSendRegistProject(project)}>{t.expandedContent.register}</button>
                                        )}
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

    const t = translations[language];

    return (
        <>
            <div id="root"></div>
            <div className={`dashboard ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>    
            <header className="header">
            <img src={logo} alt="Logo" className="logo" />  
                        <div className="header-center">
                        <button onClick={handleSignOut}>{t.signOut}</button>
                        {userDetails.role === 'Worker' && (<button onClick={handleRegisterAdmin}>{t.registerAdmin}</button>)}
                        <button onClick={handleViewNotifications}>{t.notify}</button> 
                        {userDetails.role === 'Guest' && (
                            <>
                                 <button onClick={handleRegisterAdmin}>{t.registerAdmin}</button>
                                 
                                 <button onClick={handleRegisterWorker}>{t.registerWorker}</button>
                            </>
                        )}
                        {userDetails.role === "Admin" && (
                            <>
                                <button onClick={handleAddProject}>{t.addProject}</button>
                                <button onClick={handleParticipant}>{t.users}</button>
                            </>
                        )} 
                    </div>
                        <button onClick={toggleLanguage}>{t.changeLanguage}</button>
                        <button onClick={handlePrint}>{t.tableHeaders.print}</button>
                        <button onClick={handleUserProfile} className='user-profile-button'>
                                {userDetails.username}
                                <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                        </button>
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
    <tbody>
        <tr>
            <td colSpan="10">
                <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                         <div className="project-card" key={project.id}>
                            <React.Fragment key={project.id}>
                                <div className="project-image-wrapper" 
                                onClick={() => openProjectModal(project)}
                                >
                                    {project.imageUrl ? (
                                        <img src={project.imageUrl} alt="Project" className="project-image" />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                        <h1>{project.projectTitle}<br /></h1>
                                        {project.startDate} - {project.endDate}<br />
                                        {renderLocations(project.location)} {/* Updated to show multiple locations */}<br />
                                        {/* {project.description}<br /> */}
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
                                            )}<br />
                                        {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                                        <>
                                                <button onClick={() => handleEditProject(project.id)}>{t.tableHeaders.edit}</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.projectTitle); }}>{t.tableHeaders.delete}</button>
                                        </>
                                    )}
                                </div>
                                <Modal 
                                isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Project Information"
                                >
                                            {
                                            modalType === 'project' &&
                                             selectedUserData &&
                                              renderProjectInfo(selectedUserData)}
                                            <button onClick={closeModal}>Close</button>
                                        </Modal>
                            </React.Fragment>
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    </tbody>
</table>
<footer className="footer">
        <p>אביטל גולדברג - glavital@jerusalem.muni.il<br />
        050-312-1883<br />
        רונית סבטי - ronit_se@jerusalem.muni.il<br />
        051-548-0763</p>
      </footer>
                </main>
            </div>
        </>
    );
};


export default HomePage;