
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../config/firebase-config';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useProjectInfo } from '../../hooks/useProjectInfo';
import logo from '../../images/logo.jpeg';
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import bird3 from '../../images/bird3.svg';

import '../add-Project/addproject.css';

import Modal from 'react-modal';

Modal.setAppElement('#root');

export const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastProjectTitle, setLastProjectTitle] = useState("");
    
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const [userData, setUserData] = useState({
        projectTitle: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        participantQuery: '',
        participants: [],
        participantList: [],
        imageUrl: '',
    });
    const { 
        participants, 
        participantQuery,
        imageFile,
        imageUrl,
        handleParticipantSearch,
        setParticipantQuery,
        uploadImage,
        setImageUrl
    } = useProjectInfo();
    
    const [error, setError] = useState('');

    const [selectedLocations, setSelectedLocations] = useState([]);
    const locations = [
        'North region',
        'South region',
        'Central area',
        'West region',
        'East region',
        'Field of addictions',
        'The field of young people and the homeless',
        'Field of group work',
        'Ultra-Orthodox field',
        'National religious field',
        'Education, training and employment, media, response'
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthenticated(true);
                const docRef = doc(db, "projects", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    
                    const projectData = docSnap.data();
                    
                    setUserData({
                        ...userData,
                        projectTitle: projectData.projectTitle,
                        startDate: projectData.startDate,
                        endDate: projectData.endDate,
                        location: projectData.location,
                        description: projectData.description,
                        participants: projectData.participants || [],
                        imageUrl: projectData.imageUrl || '',
                        participantList: projectData.participants || [],
                    });
                    
                    setLastProjectTitle(projectData.projectTitle || ''); // Update lastProjectTitle
                
                       // Preselect locations based on projectData
                       setSelectedLocations(projectData.location || []);

                } else {
                    console.log("No such document!");
                }
                setLoading(false);
            } else {
                navigate('/homePage');
            }
        });

        return () => unsubscribe();
    }, [auth, id, navigate]);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedLocations(prevState => [...prevState, value]);
        } else {
            setSelectedLocations(prevState => prevState.filter(location => location !== value));
        }
    };


    const updateParticipants = async (notRemovedParticipant) => {
        const batch = writeBatch(db);
        for (const participant of userData.participantList) {
            const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                const projectIndex = userProjects.indexOf(lastProjectTitle);
                if (doc.data().id === participant) {
                    if (projectIndex !== -1) {
                        userProjects.splice(projectIndex, 1);
                    }
                    if (notRemovedParticipant){
                        userProjects.push(userData.projectTitle);
                    }
                    batch.update(participantRef, { projects: userProjects });
                }
            });
        }
        await batch.commit();
    };


    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setUserData((prevDetails) => ({
                ...prevDetails,
                imageFile: files[0]
            }));
        } else if (name === 'location') {
            setUserData((prevDetails) => ({
                ...prevDetails,
                location: value
            }));
        } else if (name === 'participantQuery') {
            setParticipantQuery(value);
        } else {
            setUserData((prevDetails) => ({
                ...prevDetails,
                [name]: value
            }));
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            if (imageFile) {
                // Delete previous image if it exists
                if (userData.imageUrl) {
                    const imageRef = ref(storage, userData.imageUrl);
                    await deleteObject(imageRef);
                }

                // Upload new image
                const uploadedImageUrl = await uploadImage(imageFile, userData.projectTitle);
                setImageUrl(uploadedImageUrl);
            }

            const docRef = doc(db, "projects", id);

            await updateDoc(docRef, {
                projectTitle: userData.projectTitle,
                startDate: userData.startDate,
                endDate: userData.endDate,
                location: userData.location,
                description: userData.description,
                imageUrl: userData.imageUrl,
                participants: userData.participantList
            });
            updateParticipants(true);
            navigate('/home');
        } catch (error) {
            console.error("Error updating document: ", error);
            setError("Error updating document");
        }
    };

    const handleAddParticipantToList = (participant) => {
        if (!userData.participantList.includes(participant.id)) {
            setUserData(prevData => ({
                ...prevData,
                participantList: [...prevData.participantList, participant.firstName + " " + participant.lastName]
            }));
        }
        console.log("add: ", userData.participantList);
    };

    const handleRemoveParticipantToList = async (participantId) => {
        try {
            console.log("remove: ", participantId);
            // Remove participant from local state
            const updatedParticipantList = userData.participantList.filter(id => id !== participantId);
            setUserData(prevData => ({
                ...prevData,
                participantList: updatedParticipantList
            }));
            // Update Firestore document for each participant
            updateParticipants(false);
        } catch (error) {
            console.error("Error removing participant:", error);
            setError("Error removing participant");
        }
    };

    const handleUploadImage = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            handleInputChange(e); // This will update the imageFile state
        }
    }

    const handleClose = () => {
        navigate('/home');
    };

    if (!authenticated) {
        return null;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

  
    const openModal = (userData) => {
        setSelectedUserData(userData);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUserData(null);
    };


    const userInfo = async (id) => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                if (userData.id === id) {
                    openModal(userData);
                }
            }
        } catch (error) {
            console.error(`Error fetching user data for ${id}:`, error);
        }
    };


    const renderUserInfo = (userData) => {
        return (
            <div>
                <>
                    <p>UserName: {userData.username}</p>
                    <p>firstName: {userData.firstName}</p>
                    <p>LastName: {userData.lastName}</p>
                    <p>Email: {userData.email}</p>
                    <p>Role: {userData.role}</p>
                    <p>Phone: {userData.phoneNumber}</p>
                    <p>Address: {userData.location}</p>
                    <p>BirthDate: {userData.birthDate}</p>
                    <p>Gender: {userData.gender}</p>
                    <p>ID: {userData.id}</p>
                    <p>Role: {userData.role}</p>
                </>               
            </div>
        );
    };

  
  
    return (
            <div className="container-wrapper">         
                <img src={bird1} alt="bird" className="bird bird1" />
                <img src={bird2} alt="bird" className="bird bird2" />
                <img src={bird3} alt="bird" className="bird bird3" />
                <div className="container2">
                <img src={logo} alt="Logo" className="logo2" />
                <form onSubmit={handleUpdateProject}>
                    <div>
                        <label>Project Title:</label>
                        <input
                            type="text"
                            name="projectTitle"
                            value={userData.projectTitle}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Start Date:</label>
                        <input
                            type="date"
                            name="startDate"
                            value={userData.startDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>End Date:</label>
                        <input
                            type="date"
                            name="endDate"
                            value={userData.endDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Select Locations:</label>
                        {locations.map((location) => (
                            <div key={location}>
                                <input
                                    type="checkbox"
                                    name="location"
                                    value={location}
                                    onChange={handleCheckboxChange}
                                />
                                {location}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={userData.description}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label>Project Image:</label>
                        <input type="file" name="image" onChange={handleUploadImage} />
                    </div>
                    <div className="participant-search">
                        <label>Add Participant:</label>
                        <input type="text" name="participantQuery" value={participantQuery} onChange={handleInputChange} />
                        <button type="button" className="search-button" onClick={handleParticipantSearch}>Search</button>
                    </div>
                    {participants.length > 0 && (
                        <>
                            <ul className="participant-search-results">
                                {participants.map(participant => (
                                    <li key={participant.id}>
                                        <button type="button" onClick={() => userInfo(participant.id)}>({participant.firstName} {participant.lastName})</button>
                                        <button type="button" className="add-participant-button" onClick={() => handleAddParticipantToList(participant)}>Add</button>
                                    </li>
                                ))}
                            </ul>

                            <Modal
                                isOpen={modalIsOpen}
                                onRequestClose={closeModal}
                                contentLabel="User Information"
                            >
                                {selectedUserData && renderUserInfo(selectedUserData)}
                                <button onClick={closeModal}>Close</button>
                            </Modal>
                        </>
                    )}

                    {error && <p className="error">{error}</p>}
                        <div className="save-close-buttons">
                            <button type="button" className="close-button" onClick={handleClose}>Close</button>
                            <button type="submit" className="save-button">Save</button>
                        </div>
                </form>
                </div>
                <div className="container3">
                    <div>
                        <label>Participant List:</label>
                        <ul className="participant-list">
                            {userData.participantList.map(id => (
                                <li key={id}>
                                    {id}
                                    <button onClick={() => handleRemoveParticipantToList(id)}>remove</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
    );
};

export default EditProject;
