
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth,signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useProjectInfo } from '../../hooks/useProjectInfo';  // Adjust the path as needed
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import bird3 from '../../images/bird3.svg';
import profileIcon from '../../images/profileIcon.png';
import logo from '../../images/logo.jpeg';
import './addproject.css';
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
        location: "الموقع",
        startDate: "تاريخ البدء",
        endDate: "تاريخ الانتهاء",
        description: "الوصف",
        projectImage: "صورة المشروع",
        addParticipant: " (إضافة مشارك (الاسم الشخصي",
        search: "بحث",
        close: "إغلاق",
        save: "حفظ",
        participantList: "قائمة المشاركين",
        remove: "إزالة",
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
        projectTitle: "כותרת הפרויקט",
        location: "מקום",
        startDate: "תאריך התחלה",
        endDate: "תאריך סיום",
        description: "תיאור",
        projectImage: "תמונת הפרויקט",
        addParticipant: "הוסף משתתף (שם פרטי)",
        search: "חפש",
        close: "סגור",
        save: "שמור",
        participantList: "רשימת משתתפים",
        remove: "הסר",
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



export const AddProject = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const toGetAuth = getAuth();
    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: ''
        }
    );
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const [language, setLanguage] = useState('ar');

    const [selectedLocations, setSelectedLocations] = useState([]);
    
    const {
        projectTitle,
        startDate,
        endDate,
        location,
        description,
        participantQuery,
        participants,
        participantList,
        imageFile,
        imageUrl,
        error,
        handleInputChange,
        handleParticipantSearch,
        handleAddParticipant,
        handleRemoveParticipant,
        uploadImage,
        updateParticipants,
        setImageUrl,
    } = useProjectInfo();

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate('/homePage'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        setSelectedLocations(prevState => {
            if (checked) {
                return [...prevState, value];
            } else {
                return prevState.filter(location => location !== value);
            }
        });
    };

    const handleViewNotifications = () => {
        navigate('/notifications');
    };


    const handleAddProject = async (e) => {
        e.preventDefault();
        
        if (selectedLocations.length === 0) {
            alert("Please select at least one location.");
            return;
        }
        
        try {
            

            const uploadedImageUrl = await uploadImage(imageFile, projectTitle);

            setImageUrl(uploadedImageUrl);
            
            const docRef = await addDoc(collection(db, "projects"), {
                projectTitle,
                startDate,
                endDate,
                location: selectedLocations,
                description,
                imageUrl: uploadedImageUrl,
                participants: participantList
            });
            await updateParticipants();
    
            navigate('/home');
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };
    
    const handleUserProfile = () => {
        navigate('/userProfile');
    };

    const handleParticipant = () => {
        navigate('/participant');
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

    const handleSignOut = async () => {
        try {
            await signOut(toGetAuth);
            navigate('/homePage');
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Error signing out. Please try again.");
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
        {userDetails.role === "Admin" && (
            <>
                <button onClick={handleAddProject}>{t.addProject}</button>
                <button onClick={handleParticipant}>{t.users}</button>
            </>
        )} 
    </div>
    <img src={logo} alt="Logo" className="logo" />
</header>
<div className={`container-wrapper ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
<img src={bird1} alt="bird" className="bird bird1" />
                <img src={bird2} alt="bird" className="bird bird2" />
                <img src={bird3} alt="bird" className="bird bird3" />
                <div className="container2">
                    <form onSubmit={handleAddProject}>
                        <div>
                            <label>{t.projectTitle}:</label>
                            <input type="text" name="projectTitle" value={projectTitle} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>{t.location}:</label>
                            {t.locations.map((location) => (
                                <div key={location}>
                                    <input
                                        type="checkbox"
                                        name="location"
                                        value={location}
                                        onChange={handleCheckboxChange}
                                    />
                                    {location}
                                </div>
                            ))}
                        </div>
                        <div>
                            <label>{t.startDate}:</label>
                            <input type="date" name="startDate" value={startDate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>{t.endDate}:</label>
                            <input type="date" name="endDate" value={endDate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>{t.description}:</label>
                            <textarea name="description" value={description} onChange={handleInputChange} required></textarea>
                        </div>
                        <div>
                            <label>{t.projectImage}:</label>
                            <input type="file" name="image" onChange={handleUploadImage} required/>
                        </div>
                        <div className="participant-search">
                            <label>{t.addParticipant}:</label>
                            <input type="text" name="participantQuery" value={participantQuery} onChange={handleInputChange} />
                            <button type="button" className="search-button" onClick={handleParticipantSearch}>Search</button>
                        </div>
                        {participants.length > 0 && (
                            <>
                            <ul className="participant-search-results">
                                {participants.map(participant => (
                                    <li key={participant.id}>
                                        <button type="button" onClick={() => userInfo(participant.id)}>({participant.firstName} {participant.lastName})</button>
                                        <button type="button" className="add-participant-button" onClick={() => handleAddParticipant(participant)}>Add</button>
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
                            {participantList.map(id => (
                                <li key={id}>
                                    {id}
                                    <button onClick={() => handleRemoveParticipant(id)}>{t.remove}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            </div>
            
    );
};

export default AddProject;