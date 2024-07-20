import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
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
        errorIncorrectEmailOrPassword: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
        passwordResetEmailSent: "تم إرسال بريد إعادة تعيين كلمة المرور! يرجى التحقق من صندوق الوارد الخاص بك",
        errorEmailExists: "البريد الإلكتروني موجود بالفعل.",
        errorPasswordsDoNotMatch: "كلمات المرور غير متطابقة.",
        errorAccountDeleted: "تم حذف حساب المستخدم هذا ولا يمكن تسجيل الدخول.",
        errorEnterEmail: "يرجى إدخال عنوان بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
        errorSendingPasswordReset: "حدث خطأ أثناء إرسال بريد إعادة تعيين كلمة المرور. حاول مرة أخرى.",
        close: "إغلاق",
        errorIdMustBe9Digits: "رقم الهوية يجب أن يكون مكوناً من 9 أرقام.",
        errorIdExists: "رقم الهوية موجود بالفعل.",
        invalidEmail: "البريد الإلكتروني غير صالح.",
        close: "إغلاق",
        invalidName: "يجب أن يتكون الاسم الأول واسم العائلة من أحرف فقط.",
        invalidDate: "تاريخ الميلاد يجب أن يكون بعد عام 1920.",
        invalidPassword: "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، رقم، ورمز خاص.",
        invalidPhoneNumber: "رقم الهاتف يجب أن يتكون من 10 أرقام.",
        male: "ذكر",
        female: "أنثى"
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
        errorIncorrectEmailOrPassword: "אימייל או סיסמה שגויים. אנא נסה שוב.",
        passwordResetEmailSent: "אימייל לאיפוס סיסמה נשלח! אנא בדוק את תיבת הדואר הנכנס שלך",
        errorEmailExists: "האימייל כבר קיים.",
        errorPasswordsDoNotMatch: "הסיסמאות אינן תואמות.",
        errorAccountDeleted: "חשבונו של משתמש זה נמחק ואינו יכול להתחבר.",
        errorEnterEmail: "אנא הזן את כתובת האימייל שלך לאיפוס סיסמה.",
        errorSendingPasswordReset: "אירעה שגיאה בשליחת אימייל לאיפוס סיסמה. אנא נסה שוב.",
        errorIdMustBe9Digits: "מספר תעודת הזהות חייב להיות בן 9 ספרות.",
        errorIdExists: "מספר תעודת הזהות כבר קיים.",
        invalidEmail: "האימייל אינו חוקי.",
        invalidName: "השם הפרטי ושם המשפחה חייבים להיות מורכבים מאותיות בלבד.",
        invalidDate: "תאריך הלידה חייב להיות לאחר 1920.",
        invalidPassword: "הסיסמה חייבת להכיל לפחות 8 תווים, כולל אות גדולה, אות קטנה, מספר ותו מיוחד.",
        invalidPhoneNumber: "מספר הטלפון חייב להיות בן 10 ספרות.",
        close: "סגור",
        male: "זכר",
        female: "נקבה"
    }
};




const Modal = ({ message, onClose }) => (
    <div className="modal">
        <div className="modal-content">
            <p>{message}</p>
            <button onClick={onClose}>{translations.heb.close}</button>
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
        if (!validator.isEmail(email)) {
            setError(t.invalidEmail);
            return;
        }
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
                alert(t.errorAccountDeleted);
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
            setError(t.errorPasswordsDoNotMatch);
            return;
        }
        if (!/^\d{9}$/.test(additionalInfo.id)) {
            setError(t.errorIdMustBe9Digits);
            return;
        }

        if (!validator.isEmail(email)) {
            setError(t.invalidEmail);
            return;
        }

        if (!/^[a-zA-Z\u0590-\u05FF\u0600-\u06FF]+$/.test(additionalInfo.firstName) || !/^[a-zA-Z\u0590-\u05FF\u0600-\u06FF]+$/.test(additionalInfo.lastName)) {
            setError(t.invalidName);
            return;
        }

        if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            setError(t.invalidPassword);
            return;
        }

        const birthDate = new Date(additionalInfo.birthDate);
        const minDate = new Date('1920-01-01');
        if (birthDate < minDate) {
            setError(t.invalidDate);
            return;
        }

        if (!/^\d{10}$/.test(additionalInfo.phoneNumber)) {
            setError(t.invalidPhoneNumber);
            return;
        }
        try {
            console.log("Starting user creation process...");
            
            const firestore = getFirestore();
            const usersCollection = collection(firestore, 'users');
            const idQuery = query(usersCollection, where('id', '==', additionalInfo.id));
            const idSnapshot = await getDocs(idQuery);

            if (!idSnapshot.empty) {
                setError(t.errorIdExists);
                return;
            }
            
            
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
            setError(t.errorEmailExists);
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
    const homebut = () => {
        navigate('/home');
    };
    const resetPassword = async () => {
        if (!email) {
            setError(t.passwordResetEmailSent);
            return;
        }
        if (!validator.isEmail(email)) {
            setError(t.invalidEmail);
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setModalMessage(t.passwordResetEmailSent);
            setShowModal(true);
        } catch (error) {
            setError(t.errorSendingPasswordReset);
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
            <div className="header-container">
                <button type="button" onClick={toggleLanguage} className="language-button">{t.changeLanguage}</button>
                <button type="button" onClick={homebut} className='back-button'>❌</button>
            </div>
                <img src={logo} alt="Logo" className="logo" />
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
                                <select name="gender" required onChange={handleInputChange}>
                                    <option value="" disabled selected>{t.genderPlaceholder}</option>
                                    <option value="male">{t.male}</option>
                                    <option value="female">{t.female}</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <input placeholder={t.idPlaceholder} type="number" name="id" required pattern="\d{9}" title={t.errorIdMustBe9Digits} onChange={handleInputChange} />
                                <input placeholder={t.phoneNumberPlaceholder} type="text" name="phoneNumber" required onChange={handleInputChange} />
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