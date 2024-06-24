// src/components/UserList.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { deleteUser, getAuth } from 'firebase/auth';
import { db } from '../../config/firebase-config';
import './styles.css'; // Ensure you have appropriate CSS


// const admin = require('firebase-admin');

// // Replace with the path to your service account JSON file
// const serviceAccount = require('../../config/levai-project-55d38-firebase-adminsdk-tfnig-0e7d932891.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // databaseURL: 'https://levai-project-55d38.firebaseio.com'  // Your database URL
// });


export const Participent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsersAndProjects = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsersAndProjects();
  }, []);

  
  const handleHomePage = () => {
    navigate('/home');
};
  
  const handleRowClick = (user) => {
    setSelectedUser(user);
  };

  // const handleDelete = async (userId) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  //   if(selectedUser){
  //     console.log("selectedUser uid", selectedUser.uid);
  //   }
  //   else{
  //     console.log("No user selected");
  //   }
  //   if (confirmDelete){
  //     try {
  //       setLoading(true); // Set loading to true
        
  //       //here should delete this selectedUser.uid from the Authentication firebase 
  //       await deleteUser(selectedUser.uid);


  //       const usersSnapshot = await getDocs(collection(db, "users"));
  //       usersSnapshot.forEach(async (userDoc) => {
  //         const userData = userDoc.data();
  //         if (userData.id === userId) {
  //           const userDocRef = doc(db, "users", userDoc.id);
  //           await deleteDoc(userDocRef);
  //           console.log(userData.id);
  //         } else {
  //           console.log("not Found");
  //         }
  //       });
        
  //       // Refresh the users list after deletion
  //       const userSnapshot = await getDocs(collection(db, 'users'));
  //       const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //       setUsers(usersList);
  //       setLoading(false); // Set loading to false
        
  //       alert("Project deleted successfully.");
  //       // Refresh the page or remove the project from the state
  //       window.location.reload();
  //     } catch (error) {
  //       console.error("Error deleting user: ", error);
  //     } finally {
  //       setLoading(false); // Set loading to false
  //     }
  //   }
  // };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    
    if (!confirmDelete || !selectedUser) {
      return;
    }
    try {
      
      console.log("selectedUser uid", selectedUser.uid);
      
      setLoading(true); // Set loading to true
  
      // Step 1: Delete user from Firebase Authentication using UID
      // admin.auth().deleteUser(selectedUser.uid)
      // .then(() => {
      //   console.log('Successfully deleted user');
      // })
      // .catch((error) => {
      //   console.error('Error deleting user:', error);
      // });

      
      
      // Step 3: Refresh the users list after deletion
      const userSnapshot = await getDocs(collection(db, 'users'));
      const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
  
      setLoading(false); // Set loading to false
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user: ", error);
      setLoading(false); // Set loading to false in case of error
      alert("Failed to delete user. Please try again.");
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
}

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="users-list-dashboard">
      <header className="header">
        <div className="header-left">
          <img src="/path/to/logo.png" alt="Logo" />
        </div>
      </header>
      <div className="content">
        <div className="buttons">
          <button onClick={handleHomePage}>Home</button>
          <button>Participant</button>
          <button>Partner</button>
        </div>
        <div className="user-table">
          <div className="table-header">
            <span>Participant Name</span>
            <span>ID #</span>
            <span>Role</span>
          </div>
          {users.map((user, index) => (
            <div className="table-row" key={user.id} onClick={() => handleRowClick(user)}>
              <span>#{index + 1}</span>
              <span>{user.firstName} {user.lastName}</span>
              <span>{user.id}</span>
              <span>{user.role}</span>
              <button >Update</button>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          ))}
        </div>
        <div className="action-buttons">
          
          <button onClick={handlePrint}>Print</button>
        </div>
      </div>
      {selectedUser && (
        <div className="user-details">
          <h2>User Details</h2>
          <p><strong>Username:</strong> {selectedUser.username}</p>
          <p><strong>First Name:</strong> {selectedUser.firstName}</p>
          <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Location:</strong> {selectedUser.location}</p>
          <p><strong>Birth Date:</strong> {selectedUser.birthDate}</p>
          <p><strong>Gender:</strong> {selectedUser.gender}</p>
          <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
          <p><strong>ID:</strong> {selectedUser.id}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          <h3>Projects</h3>
          <ol>
              {selectedUser.projects && selectedUser.projects.map((project, index) => (
              <li key={index}>{project}</li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Participent;
