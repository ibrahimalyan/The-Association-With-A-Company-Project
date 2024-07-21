
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './homeStyles.css'; // Import CSS for styling
import logo from '../../images/logo.jpeg';
import editImg from '../../images/edit.png'
import trash from '../../images/trash.png'
import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase-config';
import profileIcon from '../../images/profileIcon.png';
import { useRegister } from '../../hooks/useRegister';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import Modal from 'react-modal';

Modal.setAppElement('#root');


const translations = {
    ar: {
        signOut: "تسجيل الخروج",
        registerAdmin: "تسجيل مشرف",
        registerWorker: "تسجيل مرشد",
        addProject: "إضافة مشروع",
        users: "المستخدمين",
        notify: "إشعارات",
        viewStatistics: "عرض الإحصائيات", // Added translation for "View Statistics"
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
            register: "التسجيل في المشروع",
            role: "الدور",
            name: "الاسم"
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
        registerWorker: "רשום מדריך",
        addProject: "הוסף פרויקט",
        users: "משתמשים",
        notify: "עדכונים",
        viewStatistics: "הצג סטטיסטיקות", // Added translation for "View Statistics"
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
            register: "הירשם לפרויקט",
            role: "תפקיד",
            name: "שם"
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
    const [sortDirection, setSortDirection] = useState('asc');
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
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
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

    const handleEditProject = (projectId) => {
        navigate(`/editProject/${projectId}`);
    };

    const handleDeleteProject = async (projectId, projectTitle) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?");
        if (confirmDelete) {
            setLoading(true);
            try {
                
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
             } catch(error){
                console.log("fuck image")
                alert("Error deleting project. Please try again.");
             }
             try{
                const projectDocRef = doc(db, "projects", projectId);
                await deleteDoc(projectDocRef);
            } catch (error) {
                console.error("fuck project");
                alert("Error deleting project. Please try again.");
            }
            try{
                console.log("users: ", users)
                const updateUserProjectsPromises = users.map(async (user) => {
                    
                    if (user.projects && user.projects.includes(projectTitle)) {
                        console.log("user: ", user)
                        const userDocRef = doc(db, "users", user.uid);
                        await updateDoc(userDocRef, {
                            projects: arrayRemove(projectTitle)
                        });
                    }
                });
                console.log("updateUserProjectsPromises: ", updateUserProjectsPromises)
                await Promise.all(updateUserProjectsPromises);
                alert("Project deleted successfully.");
            } catch (error) {
                console.error("fuck user");
                alert("Error deleting project. Please try again.");
            }finally {
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

    const sortParticipants = () => {
        const sortedParticipants = [...nameParticipants[selectedProject.id]];
        sortedParticipants.sort((a, b) => {
            const userA = users.find(user => `${user.firstName} ${user.lastName}` === a);
            const userB = users.find(user => `${user.firstName} ${user.lastName}` === b);
            if (!userA || !userB) return 0; // If user not found, keep the same order
    
            const roleOrder = ['Admin', 'Worker', 'Guest', 'Unknown'];
            const roleA = roleOrder.indexOf(userA.role) !== -1 ? roleOrder.indexOf(userA.role) : roleOrder.length;
            const roleB = roleOrder.indexOf(userB.role) !== -1 ? roleOrder.indexOf(userB.role) : roleOrder.length;
    
            if (sortDirection === 'asc') {
                return roleA - roleB;
            } else {
                return roleB - roleA;
            }
        });
    
        setNameParticipants(prevState => ({
            ...prevState,
            [selectedProject.id]: sortedParticipants
        }));
    
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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
 
    const handleViewStatistics = () => {
        navigate('/statistics');
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

    const openModal = (userData) => {
        setSelectedUserData(userData);
        setModalIsOpen(true);
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };
    const closepop = () => {
        setSelectedProject(null);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserData(null);
    };
    
    const renderUserInfo = (userData, project) => {
        if (!selectedUserData) return null;
        if (userDetails.role === "Guest" || (userDetails.role === 'Worker' && !isParticipant(project))){
            return (
                <div className="modaluser-content">
                <>
                    <p>firstName: {userData.firstName}</p>
                    <p>LastName: {userData.lastName}</p>
                    <p>Email: {userData.email}</p>
                    <p>Phone: {userData.phoneNumber}</p>
                    <p>Gender: {userData.gender}</p>
                </>              
            </div>
            )    
        }
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
                    {project.imageUrl ? (
                    <img src={project.imageUrl} alt="Project" className="project-image2" />
                    ) : (
                    'No Image'
                    )}
                    </p>
                    <h1><p><strong>{t.expandedContent.projectTitle}:</strong> {project.projectTitle}</p></h1>
                    <p><strong>{t.expandedContent.startDate}:</strong> {project.startDate}
                    <strong> {t.expandedContent.endDate}:</strong> {project.endDate}</p>
                    <p><strong>{t.expandedContent.location}:</strong> {renderLocations(project.location)}</p>
                    <p><strong>{t.expandedContent.description}:</strong></p> <p> {project.description}</p> 
                    {(userDetails.role === 'Admin' || (userDetails.role === 'Worker' && isParticipant(project))) && (
                    <>
                        <p><strong>{t.expandedContent.numberOfParticipants}:</strong> {project.participants.length}</p>
                        <p><strong>{t.expandedContent.participants}:</strong></p>
                        <table className="participants-table">
                            <thead>
                                <tr>
                                    <th>
                                        <button onClick={sortParticipants}>
                                            {sortDirection === 'asc' ? '↑' : '↓'} {t.expandedContent.role}
                                        </button>
                                    </th>
                                    <th>{t.expandedContent.name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nameParticipants[project.id] ? (
                                    nameParticipants[project.id].map((name, index) => {
                                        const user = users.find(user => `${user.firstName} ${user.lastName}` === name);
                                        return (
                                            <tr key={index}>
                                                <td>{user ? user.role : 'Unknown'}</td>
                                                <td>
                                                    <button onClick={() => userInfo(name)} className='usersbutton'>
                                                        {name}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="2">Loading...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </>
                    )}
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="User Information"
                        className="modal1"
                        overlayClassName="modal-overlay"
                    >
                        {selectedUserData && renderUserInfo(selectedUserData, project)}
                        <button onClick={closeModal} className="close-button6">Close</button>
                    </Modal>

                                        {((userDetails.role === 'Guest' || (userDetails.role === 'Worker' && !isParticipant(project))) && rendersWorkersSpecificProject(project.id))}
                                        {((userDetails.role === 'Worker' && !isParticipant(project)) || userDetails.role === 'Guest'&& !isParticipant(project)) && (
                                            <button onClick={() => handleSendRegistProject(project)}>{t.expandedContent.register}</button>
                                        )}
                                        <button onClick={closepop} className="close-button6">Close</button>
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
    };
    const handleSendRegistProject = async (project) =>{
        console.log("notifies: ", notifies);
        let notification = {};
        
        
        const confirmRegist = window.confirm("Are you sure you want to regist to this project?");    
        if (confirmRegist){
            if (workersInfo[project.id].bool){
                try{
                    if (notifies){
                        for (notification of notifies){
                            if (notification.projectId === project.id && notification.userId === userDetails.uid){
                                alert ("Notification already sent to this worker.");
                                return null;
                            }
                        }
                    }
                    await handleAddNotification(project, false);
                    window.location.reload();
                }catch(error){
                    console.log("Error adding project register: ", error);
                }
            }else{
                try{
                    if (notifies){
                        for (notification of notifies){
                            if (notification.projectId === project.id && notification.userId === userDetails.uid){
                                console.log("fuck")
                                alert ("Notification already sent to this worker.");
                                return null;
                            }
                        }
                    }
                await handleAddNotification(project, true);
            }catch(error){
                console.log("Error adding project register: ", error);
                }
            }
            window.location.reload()
        }
    };

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
                            {(userDetails.role === 'Worker' || userDetails.role === 'Admin') && (
                                <button onClick={handleViewNotifications}>{t.notify}</button>  
                            )} 
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
                                    <button onClick={handleViewStatistics}>{t.viewStatistics}</button> {/* Updated button */}
                                </>
                            )} 
                            </div>
                            <div className="header-right">
                                <button onClick={toggleLanguage} className="lang-button">{t.changeLanguage}</button>
                                <button onClick={handlePrint}className='print-but'>{t.tableHeaders.print}</button>
                                <button onClick={handleUserProfile} className='user-profile-button'>
                                    {userDetails.username}
                                    <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                            </button>
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
                                <button className='clearfilter' onClick={clearFilter}>Clear Filter</button>
                                <button className='clearfilter' type="button" onClick={projectFilterUser}>
                                    {isFilterApplied ? "Clear Filter Projects" : "My Projects"}
                                </button>
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
                                                            onClick={() =>     handleProjectClick(project)}
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
                                                                            <div className='buttons-container'>
                                                                                <button className='editbut' onClick={() => handleEditProject(project.id)}>
                                                                                    <img src={editImg} alt='Edit' />
                                                                                </button>
                                                                                <button className='deletbut' onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.projectTitle); }}>
                                                                                    <img src={trash} alt='Delete' />
                                                                                </button>
                                                                            </div>                                       
                                                                            </>
                                                                )}
                                                            </div>

                                                            {selectedProject && (
                                                <div className="modal">
                                                    <div className="modal-content">
                                                        {renderProjectInfo(selectedProject)}
                                                    </div>
                                                </div>
                                            )}
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