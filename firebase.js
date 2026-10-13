
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVEbz0YoCz47lEfc4lf8EjCjW7oa09dNw",
  authDomain: "book-collection-8fca4.firebaseapp.com",
  projectId: "book-collection-8fca4",
  storageBucket: "book-collection-8fca4.firebasestorage.app",
  messagingSenderId: "1051478665022",
  appId:  "1:1051478665022:web:a7f510e90abf7c32d9ee6f"  
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
