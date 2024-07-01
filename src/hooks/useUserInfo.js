// src/hooks/useUserInfo.js
import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase-config';
import { doc, setDoc } from "firebase/firestore";

export const useUserInfo = () => {
    const [uid, setUid] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState({
        username: "",
        firstName: "",
        lastName: "",
        location: "",
        birthDate: "",
        gender: "",
        phoneNumber: "",
        id: "",
        role: "Guest",
        uid: ""
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const userId = user.uid;
                setUid(userId);
                setAdditionalInfo(prevInfo => ({
                    ...prevInfo,
                    uid: userId
                }));
            } else {
                setUid(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const saveUserInfo = async () => {
            if (uid) {
                try {
                    await setDoc(doc(db, 'users', uid), additionalInfo, { merge: true });
                } catch (error) {
                    console.error("Error saving user info: ", error);
                }
            }
        };

        saveUserInfo();
    }, [uid, additionalInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdditionalInfo(prevInfo => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    return {
        uid,
        additionalInfo,
        handleInputChange
    };
};
