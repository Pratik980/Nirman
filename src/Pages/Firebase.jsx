// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQoYuHnjucS0XngBCK-6of-zu1ma3DArc",
  authDomain: "gharnirman-3a8a4.firebaseapp.com",
  projectId: "gharnirman-3a8a4",
  storageBucket: "gharnirman-3a8a4.appspot.com",
  messagingSenderId: "384421044335",
  appId: "1:384421044335:web:4acabac8ce0424bfbdad9a",
  measurementId: "G-6BS87EWBR0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional: Use try-catch in case Analytics isn't supported (e.g., in SSR or Node)
try {
  getAnalytics(app);
} catch (error) {
  console.warn("Analytics not supported in this environment:", error);
}

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;