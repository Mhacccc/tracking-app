// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPmQAbJgFF1CM6gtlt9jw0k6bS4H6xAwc",
  authDomain: "tracking-app-41af8.firebaseapp.com",
  projectId: "tracking-app-41af8",
  storageBucket: "tracking-app-41af8.firebasestorage.app",
  messagingSenderId: "1015015319057",
  appId: "1:1015015319057:web:69b80433be83ab8685f3b0",
  measurementId: "G-8ZNP4VD21D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
