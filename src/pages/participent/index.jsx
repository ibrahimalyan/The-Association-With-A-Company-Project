
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import logo from '../../images/logo.jpeg';
import { db } from '../../config/firebase-config';
import './styles.css'; // Ensure you have appropriate CSS

export const Participent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterId, setFilterId] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);  
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setAuthenticated(true);
            fetchUsersAndProjects();
        } else {
            navigate('/signin'); // Redirect to sign-in page if not authenticated
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

  const applyFilters = () => {
    const filtered = users.filter(user => 
      (user.firstName.toLowerCase().includes(filterName.toLowerCase()) || user.lastName.toLowerCase().includes(filterName.toLowerCase())) &&
      user.id.toString().includes(filterId) &&
      user.role.toLowerCase().includes(filterRole.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="users-list-dashboard">
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
        </div>
      </header>
      <div className="content">
        <div className="buttons">
          <button onClick={handleHomePage}>Home</button>
          <button>Participant</button>
          <button>Partner</button>
        </div>
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Filter by name" 
            value={filterName} 
            onChange={(e) => setFilterName(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Filter by ID #" 
            value={filterId} 
            onChange={(e) => setFilterId(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Filter by role" 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)} 
          />
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
        <div className="user-table">
          <div className="table-header">
            <span>Participant Name</span>
            <span>ID #</span>
            <span>Role</span>
          </div>
          {filteredUsers.map((user, index) => (
            <div className="table-row" key={user.id} onClick={() => handleRowClick(user)}>
              <span>#{index + 1}</span>
              <span>{user.firstName} {user.lastName}</span>
              <span>{user.id}</span>
              <span>{user.role}</span>
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