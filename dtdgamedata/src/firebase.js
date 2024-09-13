// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDEHtf0N6cbq6nvIz8sF88X4f4tcibNHVw",
    authDomain: "dtdgamedata.firebaseapp.com",
    projectId: "dtdgamedata",
    storageBucket: "dtdgamedata.appspot.com",
    messagingSenderId: "866630183676",
    appId: "1:866630183676:web:1f816353e1f19a95374579",
    measurementId: "G-R0S26RMWS8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
