    // src/pages/notifications/Notifications.js
    import React, { useEffect, useState } from 'react';
    import { auth, db } from '../../config/firebase-config';
    import { useNavigate } from 'react-router-dom';
    import { useRegister } from '../../hooks/useRegister';
    import { doc, deleteDoc, getDocs, collection, getDoc, writeBatch, where } from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';
    import './styles.css';
    
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
        const [selectedRequest, setSelectedRequest] = useState(null);
        const [selectedProjectUser, setSelectedProjectUser] = useState(null);
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
                            if (userData.role === 'Guest'){
                                navigate('/home');
                            }
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
                return null;
            });
            const user = users.filter((user) => {
                if(user.uid === userID){
                    return user;
                }
                return null;
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
                if (notification.registTo === 'Admin') {
                    notificationUidAdmin = notification.id;
                }
            }
            const render = renderRegistProjects();
        
            const hasRegisterListData = registerList.length > 0;
            const hasProjectListData = notifies.filter(notify => notify.workerID.includes(userDetails.uid)).length > 0;
        
            if (acceptanceList.length === 0 && !hasRegisterListData && !hasProjectListData) {
                return <p className="notification-message">No notifications</p>;
            }
        
            return (
                <>
                    
                    <div className={`tables-container ${!hasRegisterListData || !hasProjectListData ? 'single-table-container' : ''}`}>
                        {hasRegisterListData && (
                            <table className="register-list-table">
                                <thead className="register-list-thead">
                                    <tr className="register-list-thead-tr">
                                        <th className="register-list-th">First Name</th>
                                        <th className="register-list-th">Last Name</th>
                                        <th className="register-list-th">Register to</th>
                                    </tr>
                                </thead>
                                <tbody className="register-list-tbody">
                                    {registerList.map((register) => (
                                        <tr className="register-list-tbody-tr" key={register.id} onClick={() => setSelectedRequest(register)}>
                                            <td className="register-list-td">{register.firstName}</td>
                                            <td className="register-list-td">{register.lastName}</td>
                                            <td className="register-list-td">{register.registTo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {hasProjectListData && render}
                    </div>
                </>
            );
        };
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
                        {render}
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
                <tr className="register-list-tbody-tr" key={`${project.id}-${user.uid}`} onClick={() => setSelectedProjectUser({ project, user, notify })}>
                    <td className="register-list-td">{user.firstName}</td>
                    <td className="register-list-td">{user.lastName}</td>
                    <td className="register-list-td">{project.projectTitle}</td>
                </tr>
            );
        };
        
        const renderRegistProjects = () => {
            const projectElements = notifies
                .filter(notify => notify.workerID.includes(userDetails.uid))
                .map(notify => renderProjectUsersDetails(notify.projectId, notify.userId, notify))
                .filter(projectElement => projectElement !== null); // Filter out null elements
        
            return (
                <table className="register-list-table">
                    <thead className="register-list-thead">
                        <tr className="register-list-thead-tr">
                            <th className="register-list-th">First Name</th>
                            <th className="register-list-th">Last Name</th>
                            <th className="register-list-th">Project Title</th>
                        </tr>
                    </thead>
                    <tbody className="register-list-tbody">
                        {projectElements.length > 0 ? projectElements : (
                            <tr className="register-list-tbody-tr">
                                <td className="register-list-td" colSpan="3">No projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            );
        };
        
        return (
            <div className="notification-list">
                {userDetails.role === 'Admin' && renderRegisterListAdmin()}
                {userDetails.role === 'Worker' && renderRegisterListWorker()}
    
                {selectedRequest && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h3>Request Details</h3>
                            <table>
                                <tbody>
                                    <tr>
                                        <td><strong>User ID:</strong></td>
                                        <td>{selectedRequest.userId}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>First Name:</strong></td>
                                        <td>{selectedRequest.firstName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Last Name:</strong></td>
                                        <td>{selectedRequest.lastName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Role:</strong></td>
                                        <td>{selectedRequest.role}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Phone Number:</strong></td>
                                        <td>{selectedRequest.phoneNumber}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Register to:</strong></td>
                                        <td>{selectedRequest.registTo}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="popup-buttons">
                                <button onClick={() => acceptUser(selectedRequest.id)}>Accept</button>
                                <button onClick={() => rejectUser(selectedRequest.id)}>Reject</button>
                                <button onClick={() => setSelectedRequest(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
    
                {selectedProjectUser && (
                      <div className="popup-overlay">
                      <div className="popup-content">
                          <h3>Project Details</h3>
                          <table>
                              <tbody>
                                  <tr>
                                      <td><strong>Project Title:</strong></td>
                                      <td>{selectedProjectUser.project.projectTitle}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Description:</strong></td>
                                      <td>{selectedProjectUser.project.description}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Start Date:</strong></td>
                                      <td>{selectedProjectUser.project.startDate}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>End Date:</strong></td>
                                      <td>{selectedProjectUser.project.endDate}</td>
                                  </tr>
                                   </tbody>
                                  </table>
                                  <h3>User Details</h3>
                                  <table>
                                  <tbody>
                                 
                                  <tr>
                                      <td><strong>First Name:</strong></td>
                                      <td>{selectedProjectUser.user.firstName}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Last Name:</strong></td>
                                      <td>{selectedProjectUser.user.lastName}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Location:</strong></td>
                                      <td>{selectedProjectUser.user.location}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Email:</strong></td>
                                      <td>{selectedProjectUser.user.email}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Phone Number:</strong></td>
                                      <td>{selectedProjectUser.user.phoneNumber}</td>
                                  </tr>
                                  <tr>
                                      <td><strong>Role:</strong></td>
                                      <td>{selectedProjectUser.user.role}</td>
                                  </tr>
                              </tbody>
                          </table>
                          <div className="popup-buttons">
                              <button onClick={() => acceptUserProject(selectedProjectUser.user.uid, selectedProjectUser.project.id, selectedProjectUser.notify.id)}>Accept</button>
                              <button onClick={() => deleteNotification(selectedProjectUser.notify.id, true, false)}>Reject</button>
                              <button onClick={() => setSelectedProjectUser(null)}>Close</button>
                          </div>
                      </div>
                  </div>
                )}
            </div>
        );
    };
    
    export default Notifications;
    