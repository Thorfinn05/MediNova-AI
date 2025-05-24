
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAtFS0k6aZUcANJAJsfwb7pP0GJuQXYOss",
  authDomain: "aethercare-f8596.firebaseapp.com",
  projectId: "aethercare-f8596",
  storageBucket: "aethercare-f8596.firebasestorage.app",
  messagingSenderId: "93987159811",
  appId: "1:93987159811:web:6b7847e9c5f928dfbef336",
  measurementId: "G-BF11PJQPZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
