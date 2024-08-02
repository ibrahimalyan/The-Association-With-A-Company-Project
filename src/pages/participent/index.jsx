import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth,signOut, onAuthStateChanged } from 'firebase/auth';
import logo from '../../images/logo.jpeg';
import profileIcon from '../../images/profileIcon.png';
import { db } from '../../config/firebase-config';
import './participent.css'; // Ensure you have appropriate CSS


const translations = {
  ar: {
    signOut: "تسجيل الخروج",
        registerAdmin: "تسجيل مشرف",
        registerWorker: "تسجيل عامل",
        addProject: "إضافة مشروع",
        users: "المستخدمين",
        notify: "إشعارات",
      home: "الرئيسية",
      participant: "المشاركين",
      partner: "الشركاء",
      filterByName: "الاسم",
      filterById: "رقم الهوية",
      filterByRole: "الدور",
      applyFilters: "بحث",
      participantName: "اسم المشارك",
      id: "رقم الهوية",
      role: "الدور",
      delete: "حذف",
      print: "طباعة",
      userDetails: "تفاصيل المستخدم",
      username: "اسم المستخدم",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      email: "البريد الإلكتروني",
      location: "الموقع",
      birthDate: "تاريخ الميلاد",
      gender: "الجنس",
      phoneNumber: "رقم الهاتف",
      close: "إغلاق",
      changeLanguage: "עברית"
  },
  heb: {
    signOut: "התנתק",
        registerAdmin: "רשום מנהל",
        registerWorker: "רשום עובד",
        addProject: "הוסף פרויקט",
        users: "משתמשים",
        notify: "עדכונים",
      home: "בית",
      participant: "משתתפים",
      partner: "שותפים",
      filterByName: "שם",
      filterById: "ת.ז",
      filterByRole: "תפקיד",
      applyFilters: "חיפוש",
      participantName: "שם המשתתף",
      id: "ת.ז",
      role: "תפקיד",
      delete: "מחק",
      print: "הדפס",
      userDetails: "פרטי משתמש",
      username: "שם משתמש",
      firstName: "שם פרטי",
      lastName: "שם משפחה",
      email: "אימייל",
      location: "מיקום",
      birthDate: "תאריך לידה",
      gender: "מין",
      phoneNumber: "מספר טלפון",
      close: "סגור",
      changeLanguage: "العربية"
  }
};



export const Participent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterName, setFilterName] = useState('');
  const toGetAuth = getAuth();
  const [filterId, setFilterId] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);  
  const [authenticated, setAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: '', // Add role to state
    uid: ''
    }
);
  const [language, setLanguage] = useState('ar');
  const navigate = useNavigate();
  const auth = getAuth();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setAuthenticated(true);
            fetchUsersAndProjects();
        } else {
            navigate('/homePage'); // Redirect to sign-in page if not authenticated
        }
    });

    return () => unsubscribe();
}, [auth, navigate]);


  const fetchUsersAndProjects = async () => {
    const userSnapshot = await getDocs(collection(db, 'users'));
    const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
    setFilteredUsers(usersList); // Initialize filteredUsers with all users
  };

  const handleHomePage = () => {
    navigate('/home');
  };

  const handleViewNotifications = () => {
    navigate('/notifications');
};

  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (selectedUser) {
      console.log("selectedUser uid", selectedUser.uid);
    } else {
      console.log("No user selected");
    }
    if (confirmDelete) {
      try {
        setLoading(true); // Set loading to true
  
        // Change the user's role to "deleted"
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach(async (userDoc) => {
          const userData = userDoc.data();
          if (userData.id === userId) {
            const userDocRef = doc(db, "users", userDoc.id);
            await updateDoc(userDocRef, { role: "deleted" }); // Update the user's role
            console.log(userData.id);
          } else {
            console.log("not Found");
          }
        });
  
        // Fetch all projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        // Remove userId from each project's participants array
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          if (projectData.participants && projectData.participants.includes(userId)) {
            const updatedParticipants = projectData.participants.filter(participantId => participantId !== userId);
            const projectDocRef = doc(db, "projects", projectDoc.id);
            await updateDoc(projectDocRef, { participants: updatedParticipants });
          }
        }
  
        // Refresh the users list after role change
        const userSnapshot = await getDocs(collection(db, 'users'));
        const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setFilteredUsers(usersList); // Update filteredUsers as well
  
        setLoading(false); // Set loading to false
  
        alert("User role updated to 'deleted' and removed from projects successfully.");
        // Refresh the page or remove the project from the state
        window.location.reload();
      } catch (error) {
        console.error("Error deleting user: ", error);
      } finally {
        setLoading(false); // Set loading to false
      }
    }
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handlePrint = () => {
    window.print();
  };
const handleUserProfile = () => {
        navigate('/userProfile');
    };

    const handleAddProject = () => {
        navigate('/addProject');
    };

    const handleParticipant = () => {
        navigate('/participant');
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

  const applyFilters = () => {
    const filtered = users.filter(user => 
      (user.firstName.toLowerCase().includes(filterName.toLowerCase()) || user.lastName.toLowerCase().includes(filterName.toLowerCase())) &&
      user.id.toString().includes(filterId) &&
      user.role.toLowerCase().includes(filterRole.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'ar' ? 'heb' : 'ar'));
};

const t = translations[language];
  return (
    <div className={`users-list-dashboard ${language === 'ar' || language === 'heb' ? 'rtl' : 'ltr'}`}>
                <header className="header">
                <img src={logo} alt="Logo" className="logo" />
                        <div className="header-center">
                        <button onClick={handleSignOut}>{t.signOut}</button>
                        <button onClick={handleHomePage} className="home-button">{t.home}</button>
                        {userDetails.role === 'Worker' && (<button>{t.registerAdmin}</button>)}
                        <button onClick={handleViewNotifications}>{t.notify}</button> 
                        {userDetails.role === "Admin" && (
                            <>
                                <button onClick={handleAddProject}>{t.addProject}</button>
                                <button onClick={handleParticipant}>{t.users}</button>
                            </>
                        )} 
                    </div>
                    <button onClick={toggleLanguage} className="change-language-button">{t.changeLanguage}</button>
                        <button onClick={handlePrint} className="print-button">{t.print}</button>
                        <button onClick={handleUserProfile} className='user-profile-button'>
                                    {userDetails.username}
                                    <img src={profileIcon} alt="profileIcon" className="profileIcon" />
                            </button>
                </header>
      <div className="users-list-content">
        <div className="users-list-filter-bar">
          <input 
            type="text" 
            placeholder={t.filterByName} 
            value={filterName} 
            onChange={(e) => setFilterName(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder={t.filterById}
            value={filterId} 
            onChange={(e) => setFilterId(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder={t.filterByRole} 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)} 
          />
          <button onClick={applyFilters} className="apply-filters-button">{t.applyFilters}</button>
        </div>
        <div className="users-list-table-wrapper">
          <div className="users-list-table">
            <div className="users-list-table-header">
              <span>#</span>
              <span>{t.participantName}</span>
              <span>{t.id}</span>
              <span>{t.role}</span>
            </div>
            {filteredUsers.map((user, index) => (
              <div className="users-list-table-row" key={user.id} onClick={() => handleRowClick(user)}>
                <span>#{index + 1}</span>
                <span>{user.firstName} {user.lastName}</span>
                <span>{user.id}</span>
                <span>{user.role}</span>
                <button onClick={() => handleDelete(user.id)} className="delete-button">{t.delete}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedUser && (
        <div className="user-details-popup">
          <div className="user-details-content">
            <h2>User Details</h2>
            <p><strong>{t.username}:</strong> {selectedUser.username}</p>
            <p><strong>{t.firstName}:</strong> {selectedUser.firstName}</p>
            <p><strong>{t.lastName}:</strong> {selectedUser.lastName}</p>
            <p><strong>{t.email}:</strong> {selectedUser.email}</p>
            <p><strong>{t.location}:</strong> {selectedUser.location}</p>
            <p><strong>{t.birthDate}:</strong> {selectedUser.birthDate}</p>
            <p><strong>{t.gender}:</strong> {selectedUser.gender}</p>
            <p><strong>{t.phoneNumber}:</strong> {selectedUser.phoneNumber}</p>
            <p><strong>{t.id}:</strong> {selectedUser.id}</p>
            <p><strong>{t.role}:</strong> {selectedUser.role}</p>
            <div className="popup-buttons">
              <button onClick={handlePrint} className="print-popup-button">{t.print}</button>
              <button onClick={() => setSelectedUser(null)} className="close-popup-button">{t.close}</button>
            </div>
            </div>
            <div className="user-project-content">
            <h3>Projects</h3>
            <ol>
              {selectedUser.projects && selectedUser.projects.map((project, index) => (
                <li key={index}>{project}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participent;