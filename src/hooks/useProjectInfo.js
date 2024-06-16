import { useState, useEffect } from 'react';
import { db, storage } from '../config/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
export const useProjectInfo = () => {
    const [projectTitle, setProjectTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [participantQuery, setParticipantQuery] = useState("");
    const [participants, setParticipants] = useState([]);
    const [participantList, setParticipantList] = useState([]);
    const [error, setError] = useState("");

    // Function to set project details from Firestore document
    const setProjectDetails = (data) => {
        if (data) {
            setProjectTitle(data.projectTitle || "");
            setStartDate(data.startDate || "");
            setEndDate(data.endDate || "");
            setLocation(data.location || "");
            setDescription(data.description || "");
            setImageUrl(data.imageUrl || "");
            setParticipantList(data.participants || []);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        switch (name) {
            case "projectTitle":
                setProjectTitle(value);
                break;
            case "startDate":
                setStartDate(value);
                break;
            case "endDate":
                setEndDate(value);
                break;
            case "location":
                setLocation(value);
                break;
            case "description":
                setDescription(value);
                break;
            case "participantQuery":
                setParticipantQuery(value);
                break;
            case "image":
                if (files[0]) {
                    setImageFile(files[0]);
                }
                break;
            default:
                break;
        }
    };

    const handleParticipantSearch = async () => {
        const q = query(collection(db, "users"), where("id", "==", participantQuery));
        try {
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            setParticipants(results);
        } catch (error) {
            setError("Error searching participants. Please try again.");
            console.error("Error searching participants: ", error);
        }
    };

    const handleAddParticipant = (participant) => {
        setParticipantList([...participantList, participant.id]);
        setParticipants([]);
        setParticipantQuery("");
    };

    const uploadImage = async () => {
        if (!imageFile) return;
        const imageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
    };

    return {
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
        setError,
        handleInputChange,
        handleParticipantSearch,
        handleAddParticipant,
        uploadImage,
    };
};
