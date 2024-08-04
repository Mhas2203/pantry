// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoKJQWfDaWsaxhdY-D_Sk3svLR-hH4vZA",
  authDomain: "pantry-tracker-d126b.firebaseapp.com",
  projectId: "pantry-tracker-d126b",
  storageBucket: "pantry-tracker-d126b.appspot.com",
  messagingSenderId: "929587135392",
  appId: "1:929587135392:web:13110c654316dece331ac5",
  measurementId: "G-E4BEM79CC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);