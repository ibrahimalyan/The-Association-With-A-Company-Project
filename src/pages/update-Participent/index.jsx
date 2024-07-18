import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import duck1 from '../../images/duck1.svg';
import './userprofileedite.css'; // Make sure to create a corresponding CSS file for styling

const db = getFirestore();


const translations = {
    ar: {
        firstName: "الاسم الأول",
        lastName: "الاسم الأخير",
        id: "رقم الهوية",
        phoneNumber: "رقم الهاتف",
        username: "اسم المستخدم",
        email: "البريد الإلكتروني",
        gender: "الجنس",
        birthDate: "تاريخ الميلاد",
        location: "الموقع",
        role: "الدور",
        close: "إغلاق",
        save: "حفظ",
        changeLanguage: "עברית",
        dir:"rtl"
    },
    heb: {
        firstName: "שם פרטי",
        lastName: "שם משפחה",
        id: "ת.ז",
        phoneNumber: "מספר טלפון",
        username: "שם משתמש",
        email: "אימייל",
        gender: "מין",
        birthDate: "תאריך לידה",
        location: "מיקום",
        role: "תפקיד",
        close: "סגור",
        save: "שמור",
        changeLanguage: "العربية",
        dir:"rtl"
    }
};



export const UserProfile = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        location: '',
        birthDate: '',
        gender: '',
        id: '',
        phoneNumber: '',
        role: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('ar');


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
                setLoading(false);
            } else {
                navigate('/homePage'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.uid), userData);
            await updateProfile(user, { displayName: userData.username });
            setError('');
            console.log("User details updated successfully.");
            navigate('/home');
        } catch (error) {
            setError("Error updating user details. Please try again.");
            console.error("Error updating user details: ", error);
        }
    };

    const handleClose = () => {
        navigate('/home'); // Navigate back to the previous page
    };

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };

    const t = translations[language];


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="user-profile-container" dir ={t.dir}>
            <img src={duck1} alt="duck" className="duck duck1" />
            <img src={duck1} alt="duck" className="duck duck2" />
            <img src={duck1} alt="duck" className="duck duck3" />
            <img src={duck1} alt="duck" className="duck duck4" />
            <img src={duck1} alt="duck" className="duck duck5" />
            <div>
            <form onSubmit={handleSubmit} className="user-profile-form">
                <div className="form-group">
                    <label className="form-label">{t.firstName}:</label>
                    <input className="form-input" type="text" name="firstName" value={userData.firstName} onChange={handleInputChange} required />
                    <label className="form-label">{t.lastName}:</label>
                    <input className="form-input" type="text" name="lastName" value={userData.lastName} onChange={handleInputChange} required />
                    <label className="form-label">{t.id}:</label>
                    <input className="form-input" type="text" name="id" value={userData.id} onChange={handleInputChange} required />
                    <label className="form-label">{t.phoneNumber}:</label>
                    <input className="form-input" type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleInputChange} required />
                    <label className="form-label">{t.username}:</label>
                    <input className="form-input" type="text" name="username" value={userData.username} onChange={handleInputChange} required />
                    <label className="form-label">{t.email}:</label>
                    <input className="form-input" type="email" name="email" value={userData.email} onChange={handleInputChange} required />
                    <label className="form-label">{t.gender}:</label>
                    <input className="form-input" type="text" name="gender" value={userData.gender} onChange={handleInputChange} required />
                    <label className="form-label">{t.birthDate}:</label>
                    <input className="form-input" type="date" name="birthDate" value={userData.birthDate} onChange={handleInputChange} required />
                    <label className="form-label">{t.location}:</label>
                    <input className="form-input" type="text" name="location" value={userData.location} onChange={handleInputChange} required />
                    <label className="form-label">{t.role}:</label>
                    <span className="form-input">{userData.role}</span>
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="save-close-buttons">
                    <button type="button" className="close-button" onClick={handleClose}>{t.close}</button>
                    <button type="button" className="language-button" onClick={toggleLanguage}>{t.changeLanguage}</button>
                    <button type="submit" className="save-button">{t.save}</button>
                </div>
            </form>
            </div>
            </div>
    );
};