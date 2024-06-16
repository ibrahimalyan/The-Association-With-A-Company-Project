import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import './styles.css'; // Make sure to create a corresponding CSS file for styling

const db = getFirestore();

export const UserProfile = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        location: '',
        birthDate: '',
        gender: '',
        id: '',
        phoneNumber: '',
        role: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
                setLoading(false);
            } else {
                navigate('/signin'); // Redirect to sign-in page if not authenticated
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.uid), userData);
            await updateProfile(user, { displayName: userData.username });
            setError('');
            console.log("User details updated successfully.");
            navigate('/home');
        } catch (error) {
            setError("Error updating user details. Please try again.");
            console.error("Error updating user details: ", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="user-profile-container">
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" value={userData.username} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={userData.email} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>First Name:</label>
                    <input type="text" name="firstName" value={userData.firstName} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input type="text" name="lastName" value={userData.lastName} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Location:</label>
                    <input type="text" name="location" value={userData.location} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Birth Date:</label>
                    <input type="date" name="birthDate" value={userData.birthDate} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Gender:</label>
                    <input type="text" name="gender" value={userData.gender} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>ID:</label>
                    <input type="text" name="id" value={userData.id} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Role:</label>
                    <input type="text" name="role" value={userData.role} onChange={handleInputChange} required />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

