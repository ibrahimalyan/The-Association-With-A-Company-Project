import React, { useState, useEffect } from 'react';
import { useStatistics } from '../../hooks/useStatistics';
import { Pie, Bar } from 'react-chartjs-2';
import logo from '../../images/logo.jpeg';
import profileIcon from '../../images/profileIcon.png';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import 'chart.js/auto';
import './Statistics.css';

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
        addParticipant: "הוסף משתתף",
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

const Statistics = () => {
    const { statistics, loading, error,userDetails } = useStatistics();
    const [language, setLanguage] = useState('heb');
    const navigate = useNavigate();
    const toGetAuth = getAuth();
    
    useEffect(() => {
        console.log("userDetails: ", userDetails);
        if (userDetails.uid !== '' ){
            if (userDetails.role !== 'Admin'){
                navigate('/home');
            }   
        }
        
    })
 

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const projectData = {
        labels: ['Total Users', 'Total Projects'],
        datasets: [
            {
                data: [statistics.totalUsers, statistics.totalProjects],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB']
            }
        ]
    };

    const userRoleData = {
        labels: ['Admin Users', 'Worker Users', 'Guest Users'],
        datasets: [
            {
                data: [statistics.adminUsers, statistics.workerUsers, statistics.guestUsers],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    const locationData = {
        labels: [
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
        datasets: [
            {
                data: [
                    statistics.locations.north,
                    statistics.locations.south,
                    statistics.locations.center,
                    statistics.locations.west,
                    statistics.locations.east,
                    statistics.locations.addiction,
                    statistics.locations.youthHomeless,
                    statistics.locations.groupWork,
                    statistics.locations.orthodox,
                    statistics.locations.nationalReligious,
                    statistics.locations.education,
                ],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ]
            }
        ]
    };

    const t = translations[language];

    const handleUserProfile = () => {
        navigate('/userProfile');
    };

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
    };

    const handleParticipant = () => {
        navigate('/participant');
    };
    const homepage = () => {
        navigate('/home');
    };

    const handleViewNotifications = () => {
        navigate('/notifications');
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

    return (
        <div className="statistics-container">
            <header className="header">
                <button onClick={handleUserProfile}>
                    <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                </button>
                <button onClick={toggleLanguage} className="change-language-button">
                    {t.changeLanguage}
                </button>
                <div className="header-center">
                    <button onClick={handleSignOut}>{t.signOut}</button>
                    <button onClick={homepage}>{t.close}</button>
                    {userDetails.role === 'Worker' && (<button>{t.registerAdmin}</button>)}
                    <button onClick={handleViewNotifications}>{t.notify}</button>
                    {userDetails.role === "Admin" && (
                        <>
                            <button onClick={handleParticipant}>{t.users}</button>
                        </>
                    )}
                </div>
                <img src={logo} alt="Logo" className="logo" />
            </header>
            <div className="chart-wrapper">
                <div className="chart-container">
                    <h2 className="chart-header">Project and User Statistics</h2>
                    <div className="pie-chart">
                        <Pie data={projectData} />
                    </div>
                </div>
                <div className="chart-container">
                    <h2 className="chart-header">User Roles Statistics</h2>
                    <div className="pie-chart">
                        <Pie data={userRoleData} />
                    </div>
                </div>
            </div>
            {/* <div className="chart-container location-chart-container">
                <h2 className="chart-header">Location Statistics</h2>
                <div className="pie-chart location-chart">
                    <Bar data={locationData} />
                </div>
            </div> */}
        </div>
    );
};

export default Statistics;
