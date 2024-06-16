import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useProjectInfo } from '../../hooks/useProjectInfo';
import logo from '../../images/logo.png';
import './styles.css';

export const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = getAuth();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
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
        setProjectDetails,
        handleInputChange,
        handleParticipantSearch,
        handleAddParticipant,
        uploadImage
    } = useProjectInfo();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthenticated(true);
                const docRef = doc(db, "projects", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProjectDetails(docSnap.data());
                } else {
                    console.log("No such document!");
                }
                setLoading(false);
            } else {
                navigate('/signin');
            }
        });

        return () => unsubscribe();
    }, [auth, id, navigate, setProjectDetails]);

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await uploadImage();
            const docRef = doc(db, "projects", id);
            
            await updateDoc(docRef, {
                projectTitle,
                startDate,
                endDate,
                location,
                description,
                imageUrl,
                participants: participantList
            });
            console.log("Document updated with ID: ", id);
            navigate('/home');
        } catch (error) {
            console.error("Error updating document: ", error);
        }
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
                    <input type="text" name="projectTitle" value={projectTitle} onChange={handleInputChange} required />
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
                    <label>Location:</label>
                    <input type="text" name="location" value={location} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea name="description" value={description} onChange={handleInputChange} required></textarea>
                </div>
                <div>
                    <label>Project Image:</label>
                    <input type="file" name="image" onChange={handleInputChange} />
                </div>
                <div className="participant-search">
                    <label>Add Participant:</label>
                    <input type="text" name="participantQuery" value={participantQuery} onChange={handleInputChange} />
                    <button type="button" onClick={handleParticipantSearch}>Search</button>
                </div>
                {participants.length > 0 && (
                    <ul className="participant-search-results">
                        {participants.map(participant => (
                            <li key={participant.id}>
                                {participant.name} ({participant.id})
                                <button type="button" onClick={() => handleAddParticipant(participant)}>Add</button>
                            </li>
                        ))}
                    </ul>
                )}
                <div>
                    <label>Participant List:</label>
                    <ul className="participant-list">
                        {participantList.map(id => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditProject;
