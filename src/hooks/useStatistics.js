import { useState, useEffect } from 'react';
import { db } from '../config/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const useStatistics = () => {
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalProjects: 0,
        activeUsers: 0,
        completedProjects: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                // Fetch total users
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const totalUsers = usersSnapshot.size;

                // Fetch total projects
                const projectsSnapshot = await getDocs(collection(db, 'projects'));
                const totalProjects = projectsSnapshot.size;

                // Fetch completed projects
                const completedProjectsQuery = query(collection(db, 'projects'), where('status', '==', 'completed'));
                const completedProjectsSnapshot = await getDocs(completedProjectsQuery);
                const completedProjects = completedProjectsSnapshot.size;

                setStatistics({
                    totalUsers,
                    totalProjects,
                    completedProjects,
                });
            } catch (err) {
                setError(err.message);
                console.error("Error fetching statistics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    return { statistics, loading, error };
};