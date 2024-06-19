// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAlCxOAs4O-1TLQln77a5XY8GJMOmtZTUc",
  authDomain: "levai-project-55d38.firebaseapp.com",
  projectId: "levai-project-55d38",
  storageBucket: "levai-project-55d38.appspot.com",
  messagingSenderId: "56464057307",
  appId: "1:56464057307:web:6c9af4d9528bea8045fdfe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const db = getFirestore(app);
export const storage = getStorage(app);