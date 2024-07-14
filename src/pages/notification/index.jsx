// src/pages/notifications/Notifications.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';


export const Notifications = () => {
    const { registerList, loading, acceptUser, rejectUser, setLoading } = useRegister();
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState(false);
    const [acceptanceList, setAcceptanceList] = useState([]);

    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: ''
        }
    );
    
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setAuthenticated(true);
                setLoading(true);
                try{
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
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
                
                const querySnapshot = await getDocs(collection(db, "acceptance"));
                const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAcceptanceList(list);
                }catch(error){
                    console.error('Error fetching user document', error);
                } 
                setLoading(false);
            } else {
                navigate('/homePage'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    if (!authenticated) {
        return null; // Or a loading spinner while checking authentication
    }
   
    if (loading) {
        return <div>Loading...</div>;
    }
  
    const renderRegisterListAdmin = () => {        
        return (
            registerList.length === 0 ? (
                <p>No pending registrations.</p>
            ) : (
                <div className="register-list">
                    {registerList.map((register) => (
                        <div key={register.id} className="register-item">
                            <p><strong>User ID:</strong> {register.userId}</p>
                            <p><strong>First Name:</strong> {register.firstName}</p>
                            <p><strong>Last Name:</strong> {register.lastName}</p>
                            <p><strong>Role:</strong> {register.role}</p>
                            <p><strong>PhoneNumber:</strong> {register.phoneNumber}</p>
                            <p><strong>Register to:</strong> {register.registTo}</p>

                            <button onClick={() => acceptUser(register.id)}>Accept</button>
                            <button onClick={() => rejectUser(register.id)}>Reject</button>
                        </div>
                    ))}
                </div>
            )
        )
    }

    const deleteNotification = (notificationId) => {
        const notificationRef = doc(db, "acceptance", notificationId);
        deleteDoc(notificationRef);
    }


    const renderRegisterListWorker = () => {
        const userNotifications = acceptanceList.filter(acceptance => acceptance.user_uid === userDetails.uid);
        let registerTo = "";
        // let notificationUid = "";
        for (const notification of userNotifications) {
            if (notification.registTo === 'Worker'){
                registerTo = notification.registTo;
                // notificationUid = notification.uid;    
            }
            
        }

        return (
            acceptanceList.length === 0 ? (
                <p>There is no any Notifications</p>
            ):(
                <>  
                    {registerTo !== "" && (
                        <div>
                            <h3>the request is accepted to change the role to: {registerTo}</h3>
                            <button >close</button>
                        </div>
                    )}
                </>
            )
        )
        
    }

    const handleBack = () => {
        navigate('/home'); // Navigate back to the homepage
    };

    return (
        <div className="notifications">
            <header className="header">
                <button onClick={handleBack}>Back</button>
                <h1>Pending Registrations</h1>
            </header>
            <main className="main-content">
                
                {userDetails.role === 'Admin' ? (
                    renderRegisterListAdmin()
                ):(
                    userDetails.role === 'Worker' ? (
                        renderRegisterListWorker()
                    ):(
                        <h1>Guest</h1>
                    )
                )

            }
            </main>
        </div>
    );
};

export default Notifications;