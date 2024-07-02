import { useState } from 'react';
import { db, storage } from '../config/firebase-config';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
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
                const data = doc.data();
                if (data.role !== "deleted") {
                    results.push({ id: doc.id, ...doc.data() });
                }
            });
            setParticipants(results);
        } catch (error) {
            setError("Error searching participants. Please try again.");
            console.error("Error searching participants: ", error);
        }
    };

    const handleAddParticipant = (participant) => {
        console.log("add: ", participant);
        setParticipantList([...participantList, participant.id]);
        setParticipants([]);
        setParticipantQuery("");
        console.log("list: ", participantList);
    };

    const handleRemoveParticipant = (participant) => {
        console.log("remove: ", participant);
        console.log("list: ", participantList);
        console.log("filter: ", participantList.filter((id) => id!== participant.id));
        setParticipantList(participantList.filter(id => id !== participant));
        setParticipants([]);
        setParticipantQuery("");
    };
    

    const uploadImage = async (imageFile, projectTitle) => {
        try {
            console.log("imageFile hook: ", projectTitle);
            if (!imageFile) return; // Handle case where no image is selected
            

            const imageRef = ref(storage, `images/${projectTitle}/${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);
            
            return imageUrl; // Return the image URL after successful upload
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image. Please try again.");
        }
    };

    const updateParticipants = async () => {
        const batch = writeBatch(db);
        for (const participant of participantList) {
            console.log(participant);
            const userQuerySnapshot = await getDocs(collection(db, "users"), where("id", "==", participant));
            userQuerySnapshot.forEach((doc) => {
                const participantRef = doc.ref;
                const userProjects = doc.data().projects || [];
                if (doc.data().id === participant) {
                    console.log("Participant found");
                    userProjects.push(projectTitle);
                    batch.update(participantRef, { projects: userProjects });
                }
                else{
                    console.log("Participant not found");
                }
            });
        }
        await batch.commit();
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
        setParticipantQuery,
        handleInputChange,
        handleParticipantSearch,
        handleAddParticipant,
        handleRemoveParticipant,
        uploadImage,
        updateParticipants,
        setImageUrl,
    };
};