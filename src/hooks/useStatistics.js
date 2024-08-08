import { useState, useEffect } from 'react';
import { db } from '../config/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const useStatistics = () => {
    const toGetAuth = getAuth();
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalProjects: 0,
        adminUsers: 0,
        workerUsers: 0,
        guestUsers: 0,
        locations: {
            north: 0,
            south: 0,
            center: 0,
            west: 0,
            east: 0,
            addiction: 0,
            youthHomeless: 0,
            groupWork: 0,
            orthodox: 0,
            nationalReligious: 0,
            education: 0,
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userDetails, setUserDetails] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '', // Add role to state
        uid: '',
        username: '',
        projects: []
        }
    );


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

                // Fetch user roles
                const adminUsersQuery = query(collection(db, 'users'), where('role', '==', 'Admin'));
                const adminUsersSnapshot = await getDocs(adminUsersQuery);
                const adminUsers = adminUsersSnapshot.size;

                const workerUsersQuery = query(collection(db, 'users'), where('role', '==', 'Worker'));
                const workerUsersSnapshot = await getDocs(workerUsersQuery);
                const workerUsers = workerUsersSnapshot.size;

                const guestUsersQuery = query(collection(db, 'users'), where('role', '==', 'Guest'));
                const guestUsersSnapshot = await getDocs(guestUsersQuery);
                const guestUsers = guestUsersSnapshot.size;

                // Generate random location statistics
                const locations = {
                    north: Math.floor(Math.random() * 2),
                    south: Math.floor(Math.random() * 3),
                    center: Math.floor(Math.random() * 1),
                    west: Math.floor(Math.random() * 2),
                    east: Math.floor(Math.random() * 4),
                    addiction: Math.floor(Math.random() * 1),
                    youthHomeless: Math.floor(Math.random() * 3),
                    groupWork: Math.floor(Math.random() * 2),
                    orthodox: Math.floor(Math.random() * 3),
                    nationalReligious: Math.floor(Math.random() * 1),
                    education: Math.floor(Math.random() * 5),
                };

                setStatistics({
                    totalUsers,
                    totalProjects,
                    adminUsers,
                    workerUsers,
                    guestUsers,
                    locations
                });

                const auth = getAuth();
                const user = auth.currentUser;
                const [userDoc] = await Promise.all([
                    getDoc(doc(db, 'users', user.uid))
                ]);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserDetails({
                        userId: userData.userId,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phoneNumber: userData.phoneNumber,
                        role: userData.role, // Set role from user data
                        uid: userData.uid,
                        username: userData.username,
                        projects: userData.projects || []
                    });
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching statistics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [toGetAuth]);


    return { statistics, loading, error, userDetails };
};