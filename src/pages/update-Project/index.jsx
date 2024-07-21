
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth,signOut, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../config/firebase-config';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useProjectInfo } from '../../hooks/useProjectInfo';
import logo from '../../images/logo.jpeg';
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import profileIcon from '../../images/profileIcon.png';
import bird3 from '../../images/bird3.svg';

import '../add-Project/addproject.css';

import Modal from 'react-modal';

Modal.setAppElement('#root');


const translations = {
    ar: {
        signOut: "تسجيل الخروج",
        registerAdmin: "تسجيل مشرف",
        registerWorker: "تسجيل عامل",
        addProject: "إضافة مشروع",
        users: "المستخدمين",
        notify: "إشعارات",
        projectTitle: "عنوان المشروع",
        startDate: "تاريخ البدء",
        endDate: "تاريخ الانتهاء",
        location: "الموقع",
        description: "الوصف",
        projectImage: "صورة المشروع",
        addParticipant: "إضافة مشارك",
        search: "بحث",
        close: "إغلاق",
        save: "حفظ",
        participantList: "قائمة المشاركين",
        remove: "إزالة",
        changeLanguage: "עברית"
    },
    heb: {
        signOut: "התנתק",
        registerAdmin: "רשום מנהל",
        registerWorker: "רשום עובד",
        addProject: "הוסף פרויקט",
        users: "משתמשים",
        notify: "עדכונים",
        projectTitle: "כותרת הפרויקט",
        startDate: "תאריך התחלה",
        endDate: "תאריך סיום",
        location: "מקום",
        description: "תיאור",
        projectImage: "תמונת הפרויקט",
        addParticipant: "הוסף משתתף",
        search: "חפש",
        close: "סגור",
        save: "שמור",
        participantList: "רשימת משתתפים",
        remove: "הסר",
        changeLanguage: "العربية"
    }
};



export const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth();
    const toGetAuth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastProjectTitle, setLastProjectTitle] = useState("");
    const [lastImageName, setLastImageName] = useState("");
    const [addImageFile, setAddImageFile] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [language, setLanguage] = useState('ar');
    const [searchInputFilter, setSearchInputFilter] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState(users);
    
    const [projectData, setProjectData] = useState({
        projectTitle: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        participantQuery: '',
        participants: [],
        participantList: [],
        imageUrl: '',
    });
    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: ''
        }
    );
    const { 
        imageFile,

        setParticipantQuery,
        uploadImage,
        setImageUrl
    } = useProjectInfo();
    
    const [error, setError] = useState('');

    const [selectedLocations, setSelectedLocations] = useState([]);
    const locations = language === 'ar' 
        ? [
            'المنطقة الشمالية',
            'المنطقة الجنوبية',
            'المنطقة المركزية',
            'المنطقة الغربية',
            'المنطقة الشرقية',
            'مجال الإدمانات',
            'مجال الشباب والمشردين',
            'مجال العمل الجماعي',
            'مجال المتدينين',
            'المجال الديني الوطني',
            'التعليم والتدريب والتوظيف والإعلام والاستجابة'
          ]
        : [
            'North region',
            'South region',
            'Central area',
            'West region',
            'East region',
            'Field of addictions',
            'The field of young people and the homeless',
            'Field of group work',
            'Ultra-Orthodox field',
            'National religious field',
            'Education, training and employment, media, response'
          ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (user) {
                setAuthenticated(true);
                try{
                    const docRef = doc(db, "projects", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                    
                        const projectDataDoc = docSnap.data();
                        
                        setProjectData({
                            ...projectData,
                            projectTitle: projectDataDoc.projectTitle,
                            startDate: projectDataDoc.startDate,
                            endDate: projectDataDoc.endDate,
                            location: projectDataDoc.location,
                            description: projectDataDoc.description,
                            participants: projectDataDoc.participants || [],
                            imageUrl: projectDataDoc.imageUrl || '',
                            imageName: projectDataDoc.imageName || '',
                            participantList: projectDataDoc.participants || [],
                        });
                        setLastProjectTitle(projectDataDoc.projectTitle || ''); // Update lastProjectTitle
                    setLastImageName(projectDataDoc.imageName || ''); // Update lastImageName
                       // Preselect locations based on projectData
                    setSelectedLocations(projectDataDoc.location || []);  
                    } else {
                        console.log("No such document!");
                    }
                    const [userDoc, usersDocs] = await Promise.all([
                        getDoc(doc(db, 'users', user.uid)),
                        getDocs(collection(db, 'users'))
                    ]);
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
                    const usersList = [];
                        
                    usersDocs.forEach((userDoc) => {
                    usersList.push({ id: userDoc.id, ...userDoc.data() });
                    });
                    setUsers(usersList);    
                }catch(error){
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
    }, [auth, id, navigate]);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedLocations(prevState => [...prevState, value]);
        } else {
            setSelectedLocations(prevState => prevState.filter(location => location !== value));
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

    const handleUserProfile = () => {
        navigate('/userProfile');
    };
    const handleViewNotifications = () => {
        navigate('/notifications');
    };
    const updateParticipants = async (notRemovedParticipant) => {
        console.log("notRemovedParticipant: ", notRemovedParticipant)
        const batch = writeBatch(db);
        console.log("projectData.participantList: ", projectData.participantList)
        for (const participant of projectData.participantList) {
            const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                const projectIndex = userProjects.indexOf(lastProjectTitle);
                // console.log("doc.data(): ", doc.data())
                // console.log("doc.data().projects: ", doc.data().projects)
                // console.log("lastProjectTitle: ", lastProjectTitle)
                const userFullName = doc.data().firstName + " " + doc.data().lastName ;
                console.log("userFullName: ", userFullName)
                console.log("participant: ", participant)
                if (userFullName === participant) {
                    console.log("projectIndex: ", projectIndex)
                    if (projectIndex !== -1) {
                        userProjects.splice(projectIndex, 1);
                    }
                    if (notRemovedParticipant){
                        console.log("projectData.projectTitle: ", projectData.projectTitle)
                        userProjects.push(projectData.projectTitle);
                    }
                    batch.update(participantRef, { projects: userProjects });
                }
            });
        }
        await batch.commit();
    };


    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setAddImageFile(files[0]);
        } else if (name === 'location') {
            setProjectData((prevDetails) => ({
                ...prevDetails,
                location: value
            }));
        } else if (name === 'participantQuery') {
            setParticipantQuery(value);
        } else {
            setProjectData((prevDetails) => ({
                ...prevDetails,
                [name]: value
            }));
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        
        if (new Date(projectData.endDate) <= new Date(projectData.startDate)) {
            alert("תאריך הסיום חייב להיות לאחר תאריך ההתחלה");
            return;
        }
        
        try {
            console.log("projectData: ", projectData);
            console.log("lastProjectTitle: ", lastProjectTitle);
            console.log("lastImageName: ", lastImageName);
            console.log("addImageFile: ", addImageFile);
            if (addImageFile) {
                // Delete previous image if it exists
               console.log("projectData: ", projectData);
                if (projectData.imageUrl) {
                    const imageRef = ref(storage, `images/${lastProjectTitle}/${lastImageName}`);
                    await deleteObject(imageRef);
                }
                console.log("projectData: ", projectData);
                // Upload new image
                const uploadedImageUrl = await uploadImage(imageFile, projectData.projectTitle);
                setImageUrl(uploadedImageUrl);
            }

            const docRef = doc(db, "projects", id);

            await updateDoc(docRef, {
                projectTitle: projectData.projectTitle,
                startDate: projectData.startDate,
                endDate: projectData.endDate,
                location: selectedLocations,
                description: projectData.description,
                imageUrl: projectData.imageUrl,
                imageName: projectData.imageName || '',
                participants: projectData.participantList
            });
            updateParticipants(true);
            navigate('/home');
        } catch (error) {
            console.error("Error updating document: ", error);
            setError("Error updating document");
        }
    };


    const handleAddParticipantWithCheck = (participant) => {
        const participantName = participant.firstName + " " + participant.lastName;
        if (projectData.participantList.includes(participantName)) {
            alert("This participant is already added.");
        } else {
            handleAddParticipantToList(participant);
        }
    };


    const handleAddParticipantToList = (participant) => {
        if (!projectData.participantList.includes(participant.id)) {
            setProjectData(prevData => ({
                ...prevData,
                participantList: [...prevData.participantList, participant.firstName + " " + participant.lastName]
            }));
        }
        console.log("add: ", projectData.participantList);
    };

    const handleRemoveParticipantToList = async (participantId) => {
        try {
            console.log("remove: ", participantId);
            // Remove participant from local state
            const updatedParticipantList = projectData.participantList.filter(id => id !== participantId);
            setProjectData(prevData => ({
                ...prevData,
                participantList: updatedParticipantList
            }));
            // Update Firestore document for each participant
            updateParticipants(false);
        } catch (error) {
            console.error("Error removing participant:", error);
            setError("Error removing participant");
        }
    };

    const handleUploadImage = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            handleInputChange(e); // This will update the imageFile state
        }
    }

    const handleClose = () => {
        navigate('/home');
    };

    if (!authenticated) {
        return null;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

  
    const openModal = (userData) => {
        setSelectedUserData(userData);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserData(null);
    };


    const userInfo = async (id) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                if (userData.id === id) {
                    openModal(userData);
                }
            }
        } catch (error) {
            console.error(`Error fetching user data for ${id}:`, error);
        }
    };

    const handleParticipantSearch = () => {
        const filtered = users.filter(user =>
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchInputFilter.toLowerCase())
        );
        console.log(filtered)
        setFilteredUsers(filtered);
    };


    const handleParticipant = () => {
        navigate('/participant');
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
                    <p>Role: {userData.role}</p>
                </>               
            </div>
        );
    };

  
  
    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };

    const t = translations[language];



    return (
        <div className="big-container">
            <header className="header">
                <button onClick={toggleLanguage} className="change-language-button">{t.changeLanguage}</button>
                <div className="header-center">
                    <button onClick={handleSignOut}>{t.signOut}</button>
                    {userDetails.role === 'Worker' && (<button>{t.registerAdmin}</button>)}
                    <button onClick={handleViewNotifications}>{t.notify}</button> 
                    <button onClick={handleUserProfile}>
                        <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                    </button>
                </div>
                <img src={logo} alt="Logo" className="logo" />
            </header>
            <div className={`container-wrapper ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
                <img src={bird1} alt="bird" className="bird bird1" />
                <img src={bird2} alt="bird" className="bird bird2" />
                <img src={bird3} alt="bird" className="bird bird3" />
                <div className="container2">
                    <form onSubmit={handleUpdateProject}>
                        <div>
                            <label>{t.projectTitle}:</label>
                            <input
                                type="text"
                                name="projectTitle"
                                value={projectData.projectTitle}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>{t.startDate}:</label>
                            <input
                                type="date"
                                name="startDate"
                                value={projectData.startDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>{t.endDate}:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={projectData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>{t.location}:</label>
                            {locations.map((location) => (
                                <div key={location}>
                                    <input
                                        type="checkbox"
                                        name="location"
                                        value={location}
                                        checked={selectedLocations.includes(location)}
                                        onChange={handleCheckboxChange}
                                    />
                                    {location}
                                </div>
                            ))}
                        </div>
                        <div>
                            <label>{t.description}:</label>
                            <textarea
                                name="description"
                                value={projectData.description}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label>{t.projectImage}:</label>
                            <input type="file" name="image" onChange={handleUploadImage} />
                        </div>
                        <div className="participant-search">
                            <label>{t.addParticipant}:</label>
                            <input type="text" name="participantQuery" value={searchInputFilter} onChange={(e) => setSearchInputFilter(e.target.value)} />
                            <button type="button" className="search-button" onClick={handleParticipantSearch}>{t.search}</button>
                        </div>
                        {filteredUsers.length > 0 && (
                            <>
                                <ul className="participant-search-results">
                                    {filteredUsers.map(participant => (
                                        <li key={participant.id}>
                                            <button type="button" onClick={() => userInfo(participant.id)}>({participant.firstName} {participant.lastName})</button>
                                            <button type="button" className="add-participant-button" onClick={() => handleAddParticipantWithCheck(participant)}>Add</button>
                                        </li>
                                    ))}
                                </ul>

                                <Modal
                                    isOpen={modalIsOpen}
                                    onRequestClose={closeModal}
                                    contentLabel="User Information"
                                >
                                    {selectedUserData && renderUserInfo(selectedUserData)}
                                    <button onClick={closeModal}>{t.close}</button>
                                </Modal>
                            </>
                        )}

                        {error && <p className="error">{error}</p>}
                            <div className="save-close-buttons">
                                <button type="button" className="close-button" onClick={handleClose}>{t.close}</button>
                                <button type="submit" className="save-button">{t.save}</button>
                            </div>
                    </form>
                </div>
                <div className="container3">
                    <div>
                        <label>{t.participantList}:</label>
                        <ul className="participant-list">
                            {projectData.participantList.map(id => (
                                <li key={id}>
                                    {id}
                                    <button onClick={() => handleRemoveParticipantToList(id)}>{t.remove}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProject;