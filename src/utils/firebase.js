import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2iWNHPBau9PVu-RWf6dXTg9DLBIJMBJM",
  authDomain: "warrantyme-ad7ca.firebaseapp.com",
  projectId: "warrantyme-ad7ca",
  storageBucket: "warrantyme-ad7ca.firebasestorage.app",
  messagingSenderId: "582821097650",
  appId: "1:582821097650:web:bf1a49eba8eaea19ac99ab",
  measurementId: "G-HPERSSWXGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-in function
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User:", result.user);
    return result.user;
  } catch (error) {
    console.error(error);
  }
};

// Logout function
const logout = async () => {
  await signOut(auth);
  console.log("User signed out");
};

export { auth, signInWithGoogle, logout };
