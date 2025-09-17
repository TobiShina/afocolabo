// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// From Firebase Console -> Project settings -> Your apps -> Web
const firebaseConfig = {
  apiKey: "AIzaSyDVD_9Y9vygVNDf2TytVqoZpp9LWZxHm5Q",
  authDomain: "blog-753af.firebaseapp.com",
  projectId: "blog-753af",
  storageBucket: "blog-753af.firebasestorage.app",
  messagingSenderId: "354706437116",
  appId: "1:354706437116:web:f53a61b46471ef5fb1b879",
  measurementId: "YOUR_MEASUREMENT_ID", // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
