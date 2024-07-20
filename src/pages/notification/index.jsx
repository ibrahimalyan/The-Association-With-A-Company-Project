    // src/pages/notifications/Notifications.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import { doc, deleteDoc, getDocs, collection, updateDoc, arrayRemove, getDoc, writeBatch, where } from 'firebase/firestore';
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
  
    const updateUser = async (projectTitle, participant) => {
        const batch = writeBatch(db);  
        const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                const docFullName = doc.data().firstName + " " + doc.data().lastName;
                if (docFullName === participant) {
                    userProjects.push(projectTitle);
                    batch.update(participantRef, { projects: userProjects });
                }
            });
        
        await batch.commit();
    }

    const updateProject = async (projectTitle, projectId, userFullName) =>{
        const batch = writeBatch(db);  
        const userQuerySnapshot = await getDocs(collection(db, "projects"));
            userQuerySnapshot.forEach((doc) => {
                const projectRef = doc.ref;
                const projectUsers = doc.data().participants || [];
                const docProjecID = doc.id;
                if ( docProjecID === projectId) {
                    projectUsers.push(userFullName);
                    console.log( "projectUsers", projectUsers);
                    batch.update(projectRef, { participants : projectUsers });
                }
            });
        
        await batch.commit();
    }

    const acceptUserProject = async (userID, projectID, notify) => {
        console.log("userID: ",userID, "projectID: " ,projectID, "notify: " ,notify);
        console.log("projects: ", projects);
        console.log("users: ", users);
        const project = projects.filter((project) => {
            if(project.id === projectID){
                return project;
            }
        });
        const user = users.filter((user) => {
            if(user.uid === userID){
                return user;
            }
        });
        console.log("project: ", project);
        console.log("user: ", user);
        const userFullName = user[0].firstName + " " + user[0].lastName;
        const projectName = project[0].projectTitle;
        await updateUser(projectName, userFullName);
        await updateProject(projectName, projectID, userFullName);
        await deleteNotification(notify, false, false);
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
        const render = renderRegistProjects();
        return (
            <>
            {acceptanceList.length === 0 ? (
                <>
                    {render}    
                </>
            ):(
                <>  
                    {registerTo !== "" && (
                        <div>
                            {(notificationAdminDeleted === false) && notificationUidAdmin && (
                                    <>
                                        <h3>the request is accepted to change the role to: {registerTo}</h3>
                                        <button onClick={() => deleteNotification(notificationUidAdmin, true, true)}>close</button>                                        
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

    const deleteNotification = async (notificationId, isAdmin, isAcceptance) => {
        if(isAdmin && isAcceptance){
            setNotificationAdminDeleted(true);
        }
        else if(!isAdmin && isAcceptance){
            setNotificationWorkerDeleted(true);
        }
        setLoading(true);
        try{
            if (isAcceptance){
                const notificationRef = doc(db, "acceptance", notificationId);
                await deleteDoc(notificationRef);        
            }
            else{
                const notificationRef = doc(db, "projectsRegisters", notificationId);
                await deleteDoc(notificationRef);
            }
            window.location.reload();
        }catch(error){
            console.error('Error deleting notification', error);
        }
        setLoading(false);
        
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
        return (
           <> 
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
                                        <button onClick={() => deleteNotification(notificationUidWorker, false, true)}>close</button>
                                    </>
                            )}
                        </div>
                    )} 
                    
                </>
            )
            
            </>
        )
        
    }

    const renderProjectUsersDetails = (projectId, userID, notify) => {
        const projectDetails = projects.filter(project => project.id === projectId);
        const project = projectDetails[0];
        const userDetails = users.filter(user => user.uid === userID);
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
            <button onClick={() => acceptUserProject(user.uid,project.id,notify.id)}>Accept</button>
            <button onClick={() => deleteNotification(notify.id, true, false)}>Reject</button>
          </div>
        );
      };

    
      const renderRegistProjects = () => {
        const projectElements = notifies
          .filter(notify => notify.workerID.includes(userDetails.uid))
          .map(notify => renderProjectUsersDetails(notify.projectId, notify.userId, notify))
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