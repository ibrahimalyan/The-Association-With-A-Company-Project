
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '../../hooks/FirebaseContext';
import logo from '../../images/logo.jpeg';
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import bird3 from '../../images/bird3.svg';
import './addproject.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const translations = {
    ar: {
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
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [language, setLanguage] = useState('ar');
    const [participantQuery, setParticipantQuery] = useState('');
    const [participants, setParticipants] = useState([]);
    const [participantList, setParticipantList] = useState([]);
    const [participantListUid, setParticipantListUid] = useState([]);
    const { 
        getProjects, 
        handleAddProject, 
        uploadImage, 
        deleteProjects, 
        getUsers, 
        updateUsers, 
        deleteUser 
    } = useFirebase();

    const [projectDetails, setProjectDetails] = useState({
        projectTitle: '',
        locations: [],
        startDate: '',
        endDate: '',
        description: '',
        image: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate('/homePage');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

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
            const users = await getUsers();
            const user = users.find(user => user.id === id);
            if (user) {
                openModal(user);
            }
        } catch (error) {
            console.error(`Error fetching user data for ${id}:`, error);
        }
    };

    const renderUserInfo = (userData) => {
        return (
            <div>
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
            </div>
        );
    };

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProjectDetails({
            ...projectDetails,
            [name]: value
        });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setProjectDetails(prevState => {
            const locations = checked
                ? [...prevState.locations, value]
                : prevState.locations.filter(location => location !== value);
            return { ...prevState, locations };
        });
    };

    const handleUploadImage = (e) => {
        setProjectDetails({
            ...projectDetails,
            image: e.target.files[0]
        });
    };

    const handleParticipantSearch = async () => {
        try {
            const users = await getUsers();
            const filteredUsers = users.filter(user =>
                user.firstName.toLowerCase().includes(participantQuery.toLowerCase())
            );
            const filterDeletedUsers = filteredUsers.filter(user => user.role !== 'deleted');
            setParticipants(filterDeletedUsers);
        } catch (error) {
            console.error('Error searching participants:', error);
        }
    };

    const handleAddParticipant = (participant) => {
        // console.log("participant:", participant);
        setParticipantList(prevList => [...prevList, (participant.firstName + " " + participant.lastName)]);
    };

    const handleRemoveParticipant = (id) => {
        setParticipantList(prevList => prevList.filter(participantId => participantId !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log("ListParticipant:", setParticipantListUid);
        console.log("image: ",projectDetails.image)
        try {
            await handleAddProject({
                ...projectDetails,
                participants: participantList
            }, projectDetails.image);
            navigate('/home');
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const t = translations[language];

    return (
        <div className="container-wrapper">
            <img src={bird1} alt="bird" className="bird bird1" />
            <img src={bird2} alt="bird" className="bird bird2" />
            <img src={bird3} alt="bird" className="bird bird3" />
            <div className="container2">
                <img src={logo} alt="Logo" className="logo2" />
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>{t.projectTitle}:</label>
                        <input 
                            type="text" 
                            name="projectTitle" 
                            value={projectDetails.projectTitle} 
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
                                    checked={projectDetails.locations.includes(location)}
                                    onChange={handleCheckboxChange}
                                />
                                {location}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label>{t.startDate}:</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={projectDetails.startDate} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>{t.endDate}:</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={projectDetails.endDate} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>{t.description}:</label>
                        <textarea 
                            name="description" 
                            value={projectDetails.description} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </div>
                    <div>
                        <label>{t.projectImage}:</label>
                        <input 
                            type="file" 
                            name="image" 
                            onChange={handleUploadImage} 
                            required
                        />
                    </div>
                    <div className="participant-search">
                        <label>{t.addParticipant}:</label>
                        <input 
                            type="text" 
                            name="participantQuery" 
                            value={participantQuery} 
                            onChange={(e) => setParticipantQuery(e.target.value)} 
                        />
                        <button 
                            type="button" 
                            className="search-button" 
                            onClick={handleParticipantSearch}
                        >
                            {t.search}
                        </button>
                    </div>
                    {participants.length > 0 && (
                        <>
                            <ul className="participant-search-results">
                                {participants.map(participant => (
                                    <li key={participant.id}>
                                        <button 
                                            type="button" 
                                            onClick={() => userInfo(participant.id)}
                                        >
                                            {participant.firstName} {participant.lastName}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="add-participant-button" 
                                            onClick={() => handleAddParticipant(participant)}
                                        >
                                            Add
                                        </button>
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
                    <div className="save-close-buttons">
                        <button 
                            type="button" 
                            className="close-button" 
                            onClick={handleClose}
                        >
                            {t.close}
                        </button>
                        <button 
                            type="submit" 
                            className="save-button"
                        >
                            {t.save}
                        </button>
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
                                <button onClick={() => handleRemoveParticipant(id, participants)}>{t.remove}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <button onClick={toggleLanguage} className="change-language-button">{t.changeLanguage}</button>
        </div>
    );
};

export default AddProject;
