
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth,signOut, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../config/firebase-config';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useProjectInfo } from '../../hooks/useProjectInfo';
import logo from '../../images/logo.jpeg';
import profileIcon from '../../images/profileIcon.png';

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
        changeLanguage: "עברית",
        errors: {
            addParticipants: "الرجاء إضافة المشاركين",
            addAdmin: "الرجاء إضافة مشرف واحد على الأقل",
        }
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
        changeLanguage: "العربية",
        errors: {
            addParticipants: "אנא הוסף משתתפים",
            addAdmin: "אנא הוסף לפחות מנהל אחד",
        }
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
    const [language, setLanguage] = useState('heb');
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

          const translations = {
            ar: {
                signOut: "تسجيل الخروج",
                registerAdmin: "تسجيل مشرف",
                registerWorker: "تسجيل عامل",
                addProject: "إضافة مشروع",
                users: "المستخدمين",
                notify: "إشعارات",
                projectTitle: "عنوان المشروع",
                location: "الموقع",
                startDate: "تاريخ البدء",
                endDate: "تاريخ الانتهاء",
                description: "الوصف",
                projectImage: "صورة المشروع",
                addParticipant: "إضافة مشارك",
                search: "بحث",
                close: "إغلاق",
                save: "حفظ",
                participantList: "قائمة المشاركين",
                remove: "إزالة",
                firstName: "الاسم الأول",
                lastName: "الاسم الأخير",
                email: "البريد الإلكتروني",
                role: "الدور",
                phoneNumber: "رقم الهاتف",
                address: "العنوان",
                birthDate: "تاريخ الميلاد",
                gender: "الجنس",
                id: "رقم الهوية",
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
                ],
                errors: {
                    selectLocation: "الرجاء تحديد موقع واحد على الأقل",
                    addParticipants: "الرجاء إضافة المشاركين",
                    addAdmin: "الرجاء إضافة مشرف واحد على الأقل",
                    invalidDates: "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء"
                }
            },
            heb: {
                signOut: "התנתק",
                registerAdmin: "רשום מנהל",
                registerWorker: "רשום עובד",
                addProject: "הוסף פרויקט",
                users: "משתמשים",
                notify: "עדכונים",
                projectTitle: "כותרת הפרויקט",
                location: "מקום",
                startDate: "תאריך התחלה",
                endDate: "תאריך סיום",
                description: "תיאור",
                projectImage: "תמונת הפרויקט",
                addParticipant: "הוסף משתתף",
                search: "חפש",
                close: "סגור",
                save: "שמור",
                participantList: "רשימת משתתפים",
                remove: "הסר",
                changeLanguage: "العربية",
                firstName: "שם פרטי",
                lastName: "שם משפחה",
                email: "אימייל",
                role: "תפקיד",
                phoneNumber: "מספר טלפון",
                address: "כתובת",
                birthDate: "תאריך לידה",
                gender: "מין",
                id: "תעודת זהות",
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
                ],
                errors: {
                    selectLocation: "אנא בחר לפחות מיקום אחד",
                    addParticipants: "אנא הוסף משתתפים",
                    addAdmin: "אנא הוסף לפחות מנהל אחד",
                    invalidDates: "תאריך הסיום חייב להיות לאחר תאריך ההתחלה"
                }
            }
        };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const user = auth.currentUser;            if (user) {
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
        const batch = writeBatch(db);
        for (const participant of projectData.participantList) {
            const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                const projectIndex = userProjects.indexOf(lastProjectTitle);
                const userFullName = doc.data().firstName + " " + doc.data().lastName ;
                if (userFullName === participant) {
                    console.log("projectIndex: ", projectIndex)
                    if (projectIndex !== -1) {
                        userProjects.splice(projectIndex, 1);
                    }
                    if (notRemovedParticipant){
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
        const t = translations[language].errors;

        if (new Date(projectData.endDate) <= new Date(projectData.startDate)) {
            alert("תאריך הסיום חייב להיות לאחר תאריך ההתחלה");
            return;
        }
        let adminFound = false;
    if (projectData.participantList) {
        projectData.participantList.forEach(participant => {
            users.forEach(user => {
                const userFullName = user.firstName + " " + user.lastName;
                if (userFullName === participant) {
                    if (user.role === 'Admin') {
                        adminFound = true;
                    }
                }
            });
        });
    } else {
        setError(t.addParticipants);
        setLoading(false);
        return;
    }

    if (!adminFound) {
        setError(t.addAdmin);
        setLoading(false);
        return;
    }
        
    try {
        if (addImageFile) {
            // Delete previous image if it exists
            if (projectData.imageUrl) {
                const imageRef = ref(storage, `images/${lastProjectTitle}/${lastImageName}`);
                await deleteObject(imageRef);
            }
            const uploadedImageUrl = await uploadImage(addImageFile, projectData.projectTitle);

            setImageUrl(uploadedImageUrl);
            const docRef = doc(db, "projects", id);
                
            await updateDoc(docRef, {
                projectTitle: projectData.projectTitle,
                startDate: projectData.startDate,
                endDate: projectData.endDate,
                location: selectedLocations,
                description: projectData.description,
                imageUrl: uploadedImageUrl,
                imageName: addImageFile.name || '',
                participants: projectData.participantList
            });
        }
        else{
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
        }
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
            (user.role !== 'deleted') && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchInputFilter.toLowerCase())
        );
        console.log(filtered)
        setFilteredUsers(filtered);
    };


    const renderUserInfo = (userData) => {
        const directionClass = language === 'ar' || language === 'heb' ? 'rtl' : 'ltr';

            if (userDetails.role === 'Worker'){
            return (
                <div className={`modaluser-content ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
                    <>
                        <p>{t.firstName}: {userData.firstName}</p>
                        <p>{t.lastName}: {userData.lastName}</p>
                        <p>{t.email}: {userData.email}</p>
                        <p>{t.phoneNumber}: {userData.phoneNumber}</p>
                        <p>{t.gender}: {userData.gender}</p>
                        <p>{t.address}: {userData.location}</p>
                        <p>{t.birthDate}: {userData.birthDate}</p>
                    </>              
                </div>
            );    
        }
        return (
            <div className={`modaluser-content ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
                <>
                    <p>{t.firstName}: {userData.firstName}</p>
                    <p>{t.lastName}: {userData.lastName}</p>
                    <p>{t.email}: {userData.email}</p>
                    <p>{t.role}: {userData.role}</p>
                    <p>{t.phoneNumber}: {userData.phoneNumber}</p>
                    <p>{t.address}: {userData.location}</p>
                    <p>{t.birthDate}: {userData.birthDate}</p>
                    <p>{t.gender}: {userData.gender}</p>
                    <p>{t.id}: {userData.id}</p>
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
        <button onClick={handleUserProfile}>
            <img src={profileIcon} alt="profileIcon" className="profileIcon" />
        </button>
        <button onClick={toggleLanguage} className="change-language-button">{t.changeLanguage}</button>
        <div className="header-center">
        <button onClick={handleSignOut}>{t.signOut}</button>
        <button onClick={handleViewNotifications}>{t.notify}</button> 
    </div>
                            <img src={logo} alt="Logo" className="logo" />
                        </header>
<div className={`container-wrapper ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
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
                            {t.locations.map((location) => (
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
                                        <button type="button" className="participantcheck-button" onClick={() => userInfo(participant.id)}>({participant.firstName} {participant.lastName})</button>
                                        <button type="button" className="add-participant-button" onClick={() => handleAddParticipantWithCheck(participant)}>Add</button>
                                    </li>
                                ))}
                            </ul>

                            <Modal
                                isOpen={modalIsOpen}
                                onRequestClose={closeModal}
                                contentLabel="User Information"
                                className="modal1"
                                overlayClassName="modal-overlay"
                            >
                                {selectedUserData && renderUserInfo(selectedUserData)}
                                <button className="close-button6" onClick={closeModal}>{t.close} </button>
                            </Modal>
                        </>
                    )}

                    {error && <p className="error">{error}</p>}
                        <div className="save-close-buttons">
                            <button type="button" className="close-button1" onClick={handleClose}>{t.close}</button>
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
                                    <button className='removeal' onClick={() => handleRemoveParticipantToList(id)}>{t.remove}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            </div>
    );
};

export default EditProject;