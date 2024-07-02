
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { useProjectInfo } from '../../hooks/useProjectInfo';  // Adjust the path as needed
import logo from '../../images/logo.jpeg';
import bird1 from '../../images/bird1.svg';
import bird2 from '../../images/bird2.svg';
import bird3 from '../../images/bird3.svg';
import './addproject.css';

export const AddProject = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate('/signin'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

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

    

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const uploadedImageUrl = await uploadImage(imageFile, projectTitle);
            console.log("uploadedImageUrl: ", uploadedImageUrl);

            setImageUrl(uploadedImageUrl);
            
            const docRef = await addDoc(collection(db, "projects"), {
                projectTitle,
                startDate,
                endDate,
                location,
                description,
                imageUrl: uploadedImageUrl,
                participants: participantList
            });
            console.log("Document written with ID: ", docRef.id);
            console.log("projectTitle: ", projectTitle);
            console.log("imageUrl: ", imageUrl);
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
                        <label>Location:</label>
                        <input type="text" name="location" value={location} onChange={handleInputChange} required />
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
                        <label>Add Participant:</label>
                        <input type="text" name="participantQuery" value={participantQuery} onChange={handleInputChange} />
                        <button type="button" className="search-button" onClick={handleParticipantSearch}>Search</button>
                    </div>
                    {participants.length > 0 && (
                        <ul className="participant-search-results">
                            {participants.map(participant => (
                                <li key={participant.id}>
                                    {participant.name} ({participant.id})
                                    <button type="button" className="add-participant-button" onClick={() => handleAddParticipant(participant)}>Add</button>
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
