import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";  // Add getDoc here
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDrAWKqX1TWFykfTVEPwajLXPxjeRURadA",
    authDomain: "prodigypb-28f3c.firebaseapp.com",
    projectId: "prodigypb-28f3c",
    storageBucket: "prodigypb-28f3c.firebasestorage.app",
    messagingSenderId: "376436174826",
    appId: "1:376436174826:web:7e202a0f2d9852534a0c93",
    measurementId: "G-JV202163Y5"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, doc, setDoc, updateDoc, arrayUnion, getDoc };  // Export getDoc
