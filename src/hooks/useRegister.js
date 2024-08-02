import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase-config';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from'react-router-dom';

export const useRegister = () => {
    const navigate = useNavigate();
    const [registerList, setRegisterList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const toGetAuth = getAuth();

    useEffect(() => {
        const fetchRegisterList = async () => {
            const user = toGetAuth.currentUser;
            setLoading(true);
            if(user){
                setAuthenticated(true);
                try {
                    const querySnapshot = await getDocs(collection(db, "register"));
                    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRegisterList(list);
                } catch (err) {
                    setError(err);
                    console.error("Error fetching register list:", err);
                }
            }
            else{
                navigate('/homePage'); 
            }
            setLoading(false);
        };
        const unsubscribe = auth.onAuthStateChanged(() => {
            fetchRegisterList();
        });
        return () => unsubscribe();
    }, [navigate, toGetAuth]);

    const registerUser = async (userId, firstName, lastName, role, phoneNumber, registTo, uid) => {
        try {
            if (!userId || !firstName || !lastName || !role || !phoneNumber || !registTo || !uid) {
                throw new Error("All fields must be provided and valid.");
            }
            const docRef = await addDoc(collection(db, "register"), {
                userId,
                firstName,
                lastName,
                role,
                phoneNumber,
                registTo,
                user_uid: uid
            });
        } catch (err) {
            setError(err);
        }
    };

    const acceptUser = async (registerId) => {
        try {
            const registerDoc = await getDoc(doc(db, "register", registerId));
            if (!registerDoc.exists()) {
                throw new Error("User registration document not found.");
            }
            const registerData = registerDoc.data();

            // Ensure the value of registTo is being checked correctly
            const userRole = registerData.registTo === 'Admin' ? 'Admin' : 'Worker';
            const user_uid = registerData.user_uid;

            await addDoc(collection(db, "acceptance"), {
                user_uid,
                check: true,
                role: userRole,
                registTo: registerData.registTo
            });

            const userRef = doc(db, "users", user_uid);
            await updateDoc(userRef, {
                role: userRole
            });

            await deleteDoc(doc(db, "register", registerId));
            setRegisterList(registerList.filter(register => register.id !== registerId));
        } catch (err) {
            setError(err);
            console.error("Error accepting user:", err);
        }
        window.location.reload();
    };

    const rejectUser = async (registerId) => {
        try {
            await deleteDoc(doc(db, "register", registerId));
            setRegisterList(registerList.filter(register => register.id !== registerId));
        } catch (err) {
            setError(err);
            console.error("Error rejecting user:", err);
        }
        window.location.reload();
    };

    return {
        registerList,
        loading,
        error,
        registerUser,
        acceptUser,
        rejectUser,  // Ensure rejectUser is included in the return object
        setLoading
    };
};