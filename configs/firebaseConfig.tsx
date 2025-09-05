// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDwcDRaT3LKm4E97cR985IUHNK6kHcZHMI",
    authDomain: "apps-e02e4.firebaseapp.com",
    databaseURL: "https://apps-e02e4-default-rtdb.firebaseio.com",
    projectId: "apps-e02e4",
    storageBucket: "apps-e02e4.appspot.com",
    messagingSenderId: "931728242416",
    appId: "1:931728242416:web:1450a322782504ce293435",
    measurementId: "G-D9J6T82264"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);