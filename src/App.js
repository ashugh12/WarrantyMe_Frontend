import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout, auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { io } from "socket.io-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

import "./App.css";

const socket = io("http://localhost:5000");

const App = () => {
  const [user, setUser] = useState(null);
  const [text, setText] = useState(localStorage.getItem("draft") || "");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    socket.on("update", (data) => {
      setText(data);
    });

    return () => socket.off("update");
  }, []);

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save your letter");
      return;
    }
  
    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();
  
      const response = await axios.post(
        "http://localhost:5000/save",
        {
          text,
          user: user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
  
      if (response.data.success) {
        alert("Letter saved to Google Drive successfully!");
      } else {
        alert("Failed to save letter to Google Drive.");
      }
    } catch (error) {
      console.error("Error saving to Google Drive:", error);
  
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please sign in again.");
        window.location.href = "http://localhost:5000/auth/google";
      } else {
        alert("An error occurred while saving. Please try again.");
      }
    }
  };
  
  
  

  const saveDraft = () => {
    localStorage.setItem("draft", text);
    alert("Draft saved locally");
  };

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const response = await axios.get("http://localhost:5000/documents", {
        params: { user: user.email },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents", error);
    }
  };

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  return (
    <div className="container">
      <h1>Google Auth + Real-time Collaboration + Google Drive</h1>
      {user ? (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={logout}>Logout</button>
          <ReactQuill value={text} onChange={(value) => {
            setText(value);
            localStorage.setItem("draft", value);
            socket.emit("edit", value);
          }} />
          <button onClick={saveDraft}>Save Draft</button>
          <button onClick={handleSave}>Save to Google Drive</button>
          <h2>Saved Documents</h2>
          <ul>
            {documents.map((doc, index) => (
              <li key={index}>{doc.name}</li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
};

export default App;
