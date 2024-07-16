import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, where, query } from 'firebase/firestore';
import { useUserInfo } from '../../hooks/useUserInfo';  // Adjust the path as needed
import logo from '../../images/logo.jpeg';
import fish1 from '../../images/fish1.svg';
import fish2 from '../../images/fish2.svg';
import fish3 from '../../images/fish3.svg';
import fish4 from '../../images/fish4.svg';
import bubbles from '../../images/airbubbles.svg';
import './auth.css'; // Import the CSS file

const db = getFirestore();



const translations = {
    ar: {
        emailPlaceholder: "البريد الإلكتروني...",
        passwordPlaceholder: "كلمة المرور...",
        confirmPasswordPlaceholder: "تأكيد كلمة المرور...",
        usernamePlaceholder: "اسم المستخدم...",
        firstNamePlaceholder: "الاسم الأول...",
        lastNamePlaceholder: "الاسم الأخير...",
        locationPlaceholder: "الموقع...",
        birthDatePlaceholder: "تاريخ الميلاد...",
        genderPlaceholder: "الجنس...",
        idPlaceholder: "رقم الهوية...",
        phoneNumberPlaceholder: "رقم الهاتف...",
        signUpButton: "تسجيل",
        signInButton: "تسجيل الدخول",
        alreadyHaveAccount: "هل لديك حساب؟ تسجيل الدخول",
        signUp: "إنشاء حساب",
        resetPasswordButton: "إعادة تعيين كلمة المرور",
        changeLanguage: "עברית",
        errorIncorrectEmailOrPassword: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى."
    },
    heb: {
        emailPlaceholder: "אימייל...",
        passwordPlaceholder: "סיסמה...",
        confirmPasswordPlaceholder: "אשר סיסמה...",
        usernamePlaceholder: "שם משתמש...",
        firstNamePlaceholder: "שם פרטי...",
        lastNamePlaceholder: "שם משפחה...",
        locationPlaceholder: "מיקום...",
        birthDatePlaceholder: "תאריך לידה...",
        genderPlaceholder: "מין...",
        idPlaceholder: "תעודת זהות...",
        phoneNumberPlaceholder: "מספר טלפון...",
        signUpButton: "הירשם",
        signInButton: "התחברות",
        alreadyHaveAccount: "כבר יש לך חשבון? התחברות",
        signUp: "הרשמה",
        resetPasswordButton: "אפס סיסמה",
        changeLanguage: "العربية",
        errorIncorrectEmailOrPassword: "אימייל או סיסמה שגויים. אנא נסה שוב."
    }
};




const Modal = ({ message, onClose }) => (
    <div className="modal">
        <div className="modal-content">
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
        </div>
    </div>
);

export const Auth = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const { additionalInfo, handleInputChange } = useUserInfo();
    const [language, setLanguage] = useState('heb');
   
    
    const t = translations[language];

    const toggleLanguage = () => {
        setLanguage(prevLanguage => prevLanguage === 'ar' ? 'heb' : 'ar');
    };

    
    
    const signIn = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const firestore = getFirestore();
            const usersCollection = collection(firestore, 'users');
            const q = query(usersCollection, where('email', '==', email));
            const userSnapshot = await getDocs(q);
            
            if (userSnapshot.empty) {
                setError(t.errorIncorrectEmailOrPassword);
                return;
            }

            // Assuming email is unique, we get the first document
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Check if the user's role is "deleted"
            if (userData.role === "deleted") {
                alert("This user account is deleted and cannot sign in.");
                return;
            }

            // Proceed with sign-in if role is not "deleted"
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User signed in: ", user);
            navigate('/home'); // Navigate to homepage on successful sign-in
        } catch (error) {
            setError(t.errorIncorrectEmailOrPassword);
        }
    }; 


    
    // const handleSignUp = () => {
    //     setShowSaveButton(true);
    // };

    const handleSave = async (e) => {
        e.preventDefault();  // Prevent default form submission 
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            console.log("Starting user creation process...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created, UID: ", user.uid);

            await setDoc(doc(db, "users", user.uid), {
                email,
                ...additionalInfo
            });
            
            console.log("User data saved to Firestore");
            console.log("User signed up: ", user);
            navigate('/home'); // Ensure this is executed after the Firestore operation
        } catch (error) {
            setError("Error signing up. Please try again.");
            console.error("Error during sign up process: ", error);
        }
    };

    const handleSubmit = (e) => {
        if (isSignUp) {
            handleSave(e);
        } else {
            signIn(e);
        }
    };

    const resetPassword = async () => {
        if (!email) {
            setError("Please enter your email address to reset password.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setModalMessage("Password reset email sent! Please check your inbox.");
            setShowModal(true);
        } catch (error) {
            setError("Error sending password reset email. Please try again.");
            console.error("Error during password reset process: ", error);
        }
    };

    return (
        <div className="auth-wrapper">
            <img src={fish1} alt="Fish" className="fish fish1" />
            <img src={fish2} alt="Fish" className="fish fish2" />
            <img src={fish3} alt="Fish" className="fish fish3" />
            <img src={fish4} alt="Fish" className="fish fish4" />
            <img src={bubbles} alt="bubbles" className="bubbles bubbles1" />
            <img src={bubbles} alt="bubbles" className="bubbles bubbles2" />
            <img src={bubbles} alt="bubbles" className="bubbles bubbles3" />
            <img src={bubbles} alt="bubbles" className="bubbles bubbles4" />
            <img src={bubbles} alt="bubbles" className="bubbles bubbles5" />
            <div className="container">
                <img src={logo} alt="Logo" />
                <form onSubmit={handleSubmit}>
                    <input placeholder={t.emailPlaceholder} required onChange={(e) => setEmail(e.target.value)} />
                    <input placeholder={t.passwordPlaceholder} type='password' required onChange={(e) => setPassword(e.target.value)} />
                    {isSignUp && (
                        <>
                            <input placeholder={t.confirmPasswordPlaceholder} type="password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                            <div className="input-group">
                                <input placeholder={t.usernamePlaceholder} name="username" required onChange={handleInputChange} />
                                <input placeholder={t.firstNamePlaceholder} name="firstName" required onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <input placeholder={t.lastNamePlaceholder} name="lastName" required onChange={handleInputChange} />
                                <input placeholder={t.locationPlaceholder} name="location" required onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <input placeholder={t.birthDatePlaceholder} type="date" name="birthDate" required onChange={handleInputChange} />
                                <input placeholder={t.genderPlaceholder} name="gender" required onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <input placeholder={t.idPlaceholder} type="number" name="id" required onChange={handleInputChange} />
                                <input placeholder={t.phoneNumberPlaceholder} type="number" name="phoneNumber" required onChange={handleInputChange} />
                            </div>
                        </>
                    )}
                    {error && <p>{error}</p>}
                    {!showSaveButton ? (
                        <>
                            <button type="submit">{isSignUp ? t.signUpButton : t.signInButton}</button>
                            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
                                {isSignUp ? t.alreadyHaveAccount : t.signUp}
                            </button>
                            {!isSignUp && (
                                <button type="button" onClick={resetPassword}>{t.resetPasswordButton}</button>
                            )}
                        </>
                    ) : (
                        <button type="submit">{t.signUpButton}</button>
                    )}
                </form>
            </div>
            {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Auth;