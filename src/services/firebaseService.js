import { db, storage } from '../config/firebase-config';
import { collection, getDocs, addDoc, writeBatch, doc, arrayRemove, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

    const getProjects = async () => {
        
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectsList = [];
        querySnapshot.forEach((doc) => {
                projectsList.push({ id: doc.id, ...doc.data() });        
            });
        return projectsList;
        };
    

    const handleAddProject = async (project, imageFile) => {
        
        if (project.locations && project.locations.length === 0) {
            throw new Error("Please select at least one location.");
        }
        let uploadedImageUrl = '';
        uploadedImageUrl = await uploadImage(imageFile, project.projectTitle);

        // Remove the image field from the project object before adding to Firestore
        const { image, ...projectWithoutImage } = project;

        const batch = writeBatch(db);
        console.log("projects.locations: ", project.locations);
        const refDox = await addDoc(collection(db, "projects"), 
            {
                imageUrl: uploadedImageUrl,
                ...projectWithoutImage,
            }
        );
        await updateUsers(project.projectTitle, project.participants , batch);
        await batch.commit();
        return refDox;
    };

    const uploadImage = async (imageFile, projectTitle) => {
        if (!imageFile) return; // Handle case where no image is selected
        const imageRef = ref(storage, `images/${projectTitle}/${imageFile.name}`);
    
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl; // Return the image URL after successful upload
        
    };


    const deleteProjects = async (project) => {
        const batch = writeBatch(db);
    
        // Delete the project document
        batch.delete(doc(db, "projects", project.id));
    
        
            // Retrieve all users
            const users = await getUsers();
    
            if (Array.isArray(users)) {
                for (const userDoc of users) {
                    if (userDoc.projects && userDoc.projects.includes(project.projectTitle)) {
                        // Remove the project title from the user's projects array
                        console.log("deleted");
                        const userDocRef = doc(db, "users", userDoc.uid);
                        console.log("userDoc.id: ", userDoc.id);
                        batch.update(userDocRef, {
                            projects: arrayRemove(project.projectTitle)
                        });
                    } else {
                        console.log("not deleted");
                    }
                }
    
                await batch.commit();
            } else {
                console.error("Expected users to be an array, but got:", users);
            }
        
    };
    
    const getUsers = async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
            usersList.push({ id: doc.id, ...doc.data() });
        });
        return usersList; 
    }

    const updateUsers = async (projectTitle, participants, batch) => {

        const participantList = await getUsers().then(users => users.filter(user => participants.includes((user.firstName + " " + user.lastName))));
    
        for (const participant of participantList) {
            let projects = participant.projects || [];
            projects.push(projectTitle);
    
            const userDocRef = doc(db, "users", participant.uid);
            const userDocSnap = await getDoc(userDocRef);
    
            if (userDocSnap.exists()) {
                batch.update(userDocRef, { projects });
            } else {
                console.error(`No document found for user ID: ${participant.id}`);
            }
        }
    };


    const deleteUser = async (userId) => {
        const batch = writeBatch(db);
        const usersList = getUsers();
        usersList.forEach(async (userDoc) => {
          const userData = userDoc.data();
          if (userData.id === userId) {
            const userDocRef = doc(db, "users", userDoc.id);
             batch.update(userDocRef, { role: "deleted" }); // Update the user's role
            console.log(userData.id);
          } else {
            console.log("not Found");
          }
          await batch.commit();
        });
    }


    export {
        getProjects,
        handleAddProject,
        uploadImage,
        deleteProjects,
        getUsers,
        updateUsers,
        deleteUser
    };
