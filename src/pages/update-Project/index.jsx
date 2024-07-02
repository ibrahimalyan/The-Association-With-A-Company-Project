
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../config/firebase-config';
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useProjectInfo } from '../../hooks/useProjectInfo';
import logo from '../../images/logo.jpeg';
import './styles.css';

export const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastProjectTitle, setLastProjectTitle] = useState("");
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
                } else {
                    console.log("No such document!");
                }
                setLoading(false);
            } else {
                navigate('/signin');
            }
        });

        return () => unsubscribe();
    }, [auth, id, navigate]);


    const updateParticipants = async (notRemovedParticipant) => {
        const batch = writeBatch(db);
        for (const participant of userData.participantList) {
            console.log(participant);
            const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                const projectIndex = userProjects.indexOf(lastProjectTitle);
                if (doc.data().id === participant) {
                    console.log("Participant found");
                    
                    if (projectIndex !== -1) {
                        console.log(lastProjectTitle);
                        userProjects.splice(projectIndex, 1);
                    }
                    console.log(userProjects);
                    if (notRemovedParticipant){
                        userProjects.push(userData.projectTitle);
                        console.log(userProjects);
                    }
                    batch.update(participantRef, { projects: userProjects });
                }
                else{
                    console.log("Participant not found");
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


            // console.log("projecttitle: ", userData.projectTitle);
            // const uploadedImageUrl = await uploadImage(imageFile, userData.projectTitle);
            // console.log("uploadedImageUrl: ", uploadedImageUrl);

            // setImageUrl(uploadedImageUrl);
            
            console.log("outside image File: ");
            if (imageFile) {
                // Delete previous image if it exists
                console.log("inside image File: ");
                if (userData.imageUrl) {
                    const imageRef = ref(storage, userData.imageUrl);
                    console.log("imageRef: ", imageRef);
                    await deleteObject(imageRef);
                }

                // Upload new image
                const uploadedImageUrl = await uploadImage(imageFile, userData.projectTitle);
                console.log("uploadedImageUrl: ", uploadedImageUrl);
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
            console.log("participant list: ", userData.participantList);
            updateParticipants(true);
            console.log("participants updated");
            console.log("Document updated with ID: ", id);
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
                participantList: [...prevData.participantList, participant.id]
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
            console.log("list: ", userData.participantList);
            console.log("filter: ", updatedParticipantList);
            // Update Firestore document for each participant
            updateParticipants(false);
        } catch (error) {
            console.error("Error removing participant:", error);
            setError("Error removing participant");
        }
    };



    const handleInputChangeImage = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            console.log("inside image File: ");
            setUserData((prevDetails) => ({
                ...prevDetails,
                imageFile: files[0]
            }));
        } else if (name === 'participantQuery') {
            console.log("inside participant query: ");
            setParticipantQuery(value);
        } else {
            console.log("inside else: ");
            setUserData((prevDetails) => ({
                ...prevDetails,
                [name]: value
            }));
        }
    };
    
    const handleUploadImage = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            handleInputChangeImage(e); // This will update the imageFile state
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

    return (
        <div className="container">
            <img src={logo} alt="Logo" className="logo" />
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
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={userData.location}
                        onChange={handleInputChange}
                        required
                    />
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
                    <ul className="participant-search-results">
                        {participants.map(participant => (
                            <li key={participant.id}>
                                {participant.name} ({participant.id})
                                <button type="button" className="add-participant-button" onClick={() => handleAddParticipantToList(participant)}>Add</button>
                            </li>
                        ))}
                    </ul>
                )}

                {error && <p className="error">{error}</p>}
                    <div className="save-close-buttons">
                        <button type="button" className="close-button" onClick={handleClose}>Close</button>
                        <button type="submit" className="save-button">Save</button>
                    </div>
            </form>
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
