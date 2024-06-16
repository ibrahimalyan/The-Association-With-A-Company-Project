// src/hooks/useUserInfo.js
import { useState } from 'react';

export const useUserInfo = () => {
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
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdditionalInfo(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));
    };

    return {
        additionalInfo,
        handleInputChange
    };
};
