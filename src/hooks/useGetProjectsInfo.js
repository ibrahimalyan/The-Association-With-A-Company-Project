import { useState, useEffect } from 'react';
import { db } from '../config/firebase-config';
import { collection, getDocs } from 'firebase/firestore';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                const projectsList = [];
                querySnapshot.forEach((doc) => {
                    projectsList.push({ id: doc.id, ...doc.data() });
                });
                setProjects(projectsList);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return { projects, loading, error };
};