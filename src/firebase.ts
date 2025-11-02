// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAYwhWE25pl7GF5Uyi_8JmyUXazfpT5298",
    authDomain: "lndreat.firebaseapp.com",
    projectId: "lndreat",
    storageBucket: "lndreat.firebasestorage.app",
    messagingSenderId: "1038030876955",
    appId: "1:1038030876955:web:957f96fd212df5c4d723be",
    measurementId: "G-LE4RKSNGQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics is initialized but not exported as it's used internally by Firebase
getAnalytics(app);

export { app };