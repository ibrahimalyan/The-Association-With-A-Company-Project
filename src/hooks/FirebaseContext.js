import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { 
  getProjects as fetchProjects,
  handleAddProject,
  uploadImage,
  deleteProjects as removeProjects,
  getUsers as fetchUsers,
  updateUsers,
  deleteUser
} from '../services/firebaseService';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [projects, setProjects] = useState(null);
  const [users, setUsers] = useState(null);

  const getProjects = useCallback(async () => {
    if (!projects) {
      const fetchedProjects = await fetchProjects();
      setProjects(fetchedProjects);
      return fetchedProjects;
    }
    return projects;
  }, [projects]);

  const getUsers = useCallback(async () => {
    if (!users) {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      return fetchedUsers;
    }
    return users;
  }, [users]);

  const handleAddProjectWithCache = useCallback(async (project, imageFile) => {
    const newProject = await handleAddProject(project, imageFile);
    setProjects((prevProjects) => {
      if (prevProjects) {
        return [...prevProjects, newProject];
      }
      return [newProject];
    });
  }, []);

  const deleteProjectsWithCache = useCallback(async (projectIds) => {
    console.log("deleteProjectsWithCache: ", projectIds);
    await removeProjects(projectIds);
  //  console.log("deleteProjectsWithCache: ", prevProjects);
    setProjects((prevProjects) => prevProjects.filter(project => !projectIds.includes(project.uid)));
  }, []);
  


  const updateUsersWithCache = useCallback(async (userId, userData) => {
    await updateUsers(userId, userData);
    setUsers((prevUsers) => prevUsers.map(user => user.id === userId ? { ...user, ...userData } : user));
  }, []);

  const deleteUserWithCache = useCallback(async (userId) => {
    await deleteUser(userId);
    setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
  }, []);

  const value = useMemo(() => ({
    getProjects,
    handleAddProject: handleAddProjectWithCache,
    uploadImage,
    deleteProjects: deleteProjectsWithCache,
    getUsers,
    updateUsers: updateUsersWithCache,
    deleteUser: deleteUserWithCache,
  }), [
    getProjects,
    handleAddProjectWithCache,
    deleteProjectsWithCache,
    getUsers,
    updateUsersWithCache,
    deleteUserWithCache
  ]);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(FirebaseContext);
};
