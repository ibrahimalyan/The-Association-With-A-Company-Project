    // src/pages/notifications/Notifications.js
    import React, { useEffect, useState } from 'react';
    import { auth, db } from '../../config/firebase-config';
    import { useNavigate } from 'react-router-dom';
    import { useRegister } from '../../hooks/useRegister';
    import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';
    
    export const Notifications = () => {
        const toGetAuth = getAuth();
        const { registerList, loading, acceptUser, rejectUser, setLoading } = useRegister();
        const navigate = useNavigate();
        const [authenticated, setAuthenticated] = useState(false);
        const [notificationWorkerDeleted, setNotificationWorkerDeleted] = useState(false);
        const [notificationAdminDeleted, setNotificationAdminDeleted] = useState(false);
        const [projects, setProjects] = useState([]);
        const [users, setUsers] = useState([]);
        const [notifies, setNotifies] = useState([]);
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
            
            setLoading(true);
            const fetchData = async () => {
                const user = toGetAuth.currentUser;
                if (user) {
                    setAuthenticated(true);
                    
                    try{
                        const [userDoc, projectDocs, usersDocs, registProject, acceptanceList] = await Promise.all([
                            getDoc(doc(db, 'users', user.uid)),
                            getDocs(collection(db, 'projects')),
                            getDocs(collection(db, 'users')),
                            getDocs(collection(db,'projectsRegisters')),
                            getDocs(collection(db,'acceptance'))
                            
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
                        const projectsList = [];
                        projectDocs.forEach((doc) => {
                            projectsList.push({ id: doc.id, ...doc.data() });
                        });
                        const usersList = [];
                        
                        usersDocs.forEach((userDoc) => {
                           usersList.push({ id: userDoc.id, ...userDoc.data() });
                        });
                        const registProjects = [];
                        registProject.forEach((registDoc) => {
                            registProjects.push({ id: registDoc.id, ...registDoc.data() });
                        });
    
                        const acceptanceListArray = [];
                        acceptanceList.forEach((acceptanceDoc) => {
                            acceptanceListArray.push({ id: acceptanceDoc.id, ...acceptanceDoc.data() });
                        });
                        setProjects(projectsList);
                        setUsers(usersList);
                        setAcceptanceList(acceptanceListArray);
                        setNotifies(registProjects);
    
                    }catch(error){
                        console.error('Error fetching user document', error);
                    } 
                    
                } else {
                    navigate('/homePage'); // Redirect to sign-in page if not authenticated
                }
                setLoading(false);
            };
            const unsubscribe = auth.onAuthStateChanged(() => {
                fetchData();
            });
    
            return () => unsubscribe();
        }, [navigate, toGetAuth]);
    
    
        if (!authenticated) {
            return null; // Or a loading spinner while checking authentication
        }
       
        if (loading) {
            return <div>Loading...</div>;
        }
      
        const renderRegisterListAdmin = () => { 
            const userNotifications = acceptanceList.filter(acceptance => acceptance.user_uid === userDetails.uid);
            let registerTo = "";
            let notificationUidAdmin = "";
            
            for (const notification of userNotifications) {
                registerTo = notification.registTo;
                if (notification.registTo === 'Admin'){
                    notificationUidAdmin = notification.id;
                      
                }
                
            }     
            
            return (
                <>
                {acceptanceList.length === 0 ? (
                    <p>There is no any Notifications</p>
                ):(
                    <>  
                        {registerTo !== "" && (
                            <div>
                                {(notificationAdminDeleted === false) && notificationUidAdmin && (
                                        <>
                                            <h3>the request is accepted to change the role to: {registerTo}</h3>
                                            <button onClick={() => deleteNotification(notificationUidAdmin, true)}>close</button>                                        
                                        </>
                                )} 
                            </div>
                        )}
                    </>
                )}
                {registerList.length === 0 ? (
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
                )}
                </>
            )
        }
    
        const deleteNotification = (notificationId, isAdmin) => {
            if(isAdmin){
                setNotificationAdminDeleted(true);
            }
            else{
                setNotificationWorkerDeleted(true);
            }
            setLoading(true);
            const notificationRef = doc(db, "acceptance", notificationId);
            deleteDoc(notificationRef);
            setLoading(false)
        }
    
    
        const renderRegisterListWorker = () => {
            const userNotifications = acceptanceList.filter(acceptance => acceptance.user_uid === userDetails.uid);
            let registerTo = "";
            let notificationUidWorker = "";
            
            for (const notification of userNotifications) {
                registerTo = notification.registTo;
                if (notification.registTo === 'Worker'){
                    notificationUidWorker = notification.id;
                    // notificationUid = notification.uid;    
                }
                
            }
            const render = renderRegistProjects();
            console.log("render",render)
            return (
                
                acceptanceList.length === 0 ? (
                    <>
                        <p>There is no any Notifications</p>
                        {render}
                    </>
                ):(
                    <>  
                        {registerTo !== "" && (
                            <div>
                                {(notificationWorkerDeleted === false) && notificationUidWorker && (
                                        <>                                
                                            <h3>the request is accepted to change the role to: {registerTo}</h3>
                                            <button onClick={() => deleteNotification(notificationUidWorker, false)}>close</button>
                                        </>
                                )}
                            </div>
                        )} 
                    </>
                )
            )
            
        }
    
        const renderProjectUsersDetails = (projectId, userID) => {
            const projectDetails = projects.filter(project => project.id === projectId);
            const project = projectDetails[0];
            console.log("userID inside:",userID)
            const userDetails = users.filter(user => user.uid === userID);
            console.log("user inside: ",userDetails)
            const user = userDetails[0];
            if (!project || !user) {
              return null; // Return null if project or user not found
            }
          
            return (
              <div key={`${project.id}-${user.uid}`} className="register-item-project">
                <h3>Project Details</h3>
                <p><strong>ProjectTitle: </strong> {project.projectTitle}</p>
                <p><strong>Description: </strong> {project.description}</p>
                <p><strong>StartDate: </strong> {project.startDate}</p>
                <p><strong>EndDate: </strong> {project.endDate}</p>
                <h3>User Details</h3>
                <p><strong>First Name: </strong> {user.firstName}</p>
                <p><strong>Last Name: </strong> {user.lastName}</p>
                <p><strong>Location: </strong> {user.location}</p>
                <p><strong>Email: </strong> {user.email} </p>
                <p><strong>PhoneNumber: </strong> {user.phoneNumber}</p>
                <button>Accept</button>
                <button>Reject</button>
              </div>
            );
          };
    
        
          const renderRegistProjects = () => {
            const projectElements = notifies
              .filter(notify => notify.workerID.includes(userDetails.uid))
              .map(notify => renderProjectUsersDetails(notify.projectId, notify.userId))
              .filter(projectElement => projectElement !== null); // Filter out null elements
          
            return (
              <div>
                {projectElements.length > 0 ? projectElements : <p>No projects found.</p>}
              </div>
            );
          };
    
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
                        renderRegisterListWorker()     
                    )}
                </main>
            </div>
        );
    };
    
    export default Notifications;