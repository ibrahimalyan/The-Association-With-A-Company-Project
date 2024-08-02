// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAWqoxnr7hBd4RiFFJiAXTrPeoXPGwViqM",
  authDomain: "company-745bf.firebaseapp.com",
  projectId: "company-745bf",
  storageBucket: "company-745bf.appspot.com",
  messagingSenderId: "1043563457995",
  appId: "1:1043563457995:web:1b61b709b60ddb55271a4e",
  measurementId: "G-WEX0XXR8NJ"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const db = getFirestore(app);
export const storage = getStorage(app);