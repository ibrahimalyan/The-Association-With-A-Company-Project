
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useProjectInfo } from '../../hooks/useProjectInfo';  // Adjust the path as needed
import logo from '../../images/logo.jpeg';
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import bird3 from '../../images/bird3.svg';
import './addproject.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export const AddProject = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const [selectedLocations, setSelectedLocations] = useState([]);
    const locations = [
        'North region',
        'South region',
        'central area', 
        'West region', 
        'East region', 
        'field of addictions', 
        'the field of young people and the homeless',
        'field of group work',
        'ultra-orthodox field',
        'national religious field',
        'Education, training and employment, media, response'
    ];
    
    const {
        projectTitle,
        startDate,
        endDate,
        location,
        description,
        participantQuery,
        participants,
        participantList,
        imageFile,
        imageUrl,
        error,
        handleInputChange,
        handleParticipantSearch,
        handleAddParticipant,
        handleRemoveParticipant,
        uploadImage,
        updateParticipants,
        setImageUrl,
    } = useProjectInfo();

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate('/homePage'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        setSelectedLocations(prevState => {
            if (checked) {
                return [...prevState, value];
            } else {
                return prevState.filter(location => location !== value);
            }
        });
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        
        if (selectedLocations.length === 0) {
            alert("Please select at least one location.");
            return;
        }
        
        try {
            

            const uploadedImageUrl = await uploadImage(imageFile, projectTitle);

            setImageUrl(uploadedImageUrl);
            
            const docRef = await addDoc(collection(db, "projects"), {
                projectTitle,
                startDate,
                endDate,
                location: selectedLocations,
                description,
                imageUrl: uploadedImageUrl,
                participants: participantList
            });
            await updateParticipants();
    
            navigate('/home');
        } catch (error) {
            console.error("Error adding document: ", error);
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
                    <form onSubmit={handleAddProject}>
                        <div>
                            <label>Project Title:</label>
                            <input type="text" name="projectTitle" value={projectTitle} onChange={handleInputChange} required />
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
                            <label>Start Date:</label>
                            <input type="date" name="startDate" value={startDate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>End Date:</label>
                            <input type="date" name="endDate" value={endDate} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea name="description" value={description} onChange={handleInputChange} required></textarea>
                        </div>
                        <div>
                            <label>Project Image:</label>
                            <input type="file" name="image" onChange={handleUploadImage} required/>
                        </div>
                        <div className="participant-search">
                            <label>Add Participant (firstname):</label>
                            <input type="text" name="participantQuery" value={participantQuery} onChange={handleInputChange} />
                            <button type="button" className="search-button" onClick={handleParticipantSearch}>Search</button>
                        </div>
                        {participants.length > 0 && (
                            <>
                            <ul className="participant-search-results">
                                {participants.map(participant => (
                                    <li key={participant.id}>
                                        <button type="button" onClick={() => userInfo(participant.id)}>({participant.firstName} {participant.lastName})</button>
                                        <button type="button" className="add-participant-button" onClick={() => handleAddParticipant(participant)}>Add</button>
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
                            {participantList.map(id => (
                                <li key={id}>
                                    {id}
                                    <button onClick={() => handleRemoveParticipant(id)}>remove</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
    );
};

export default AddProject;
