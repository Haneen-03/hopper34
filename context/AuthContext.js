// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to the Firebase Auth state and set the local state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
  
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            fullName: userData.fullName || user.displayName || 'User',
            isAdmin: userData.isAdmin || false,
          });
          setIsAdmin(userData.isAdmin || false);
        } catch (error) {
          console.error("Error fetching user doc:", error);
        }
      } else {
        setCurrentUser(null);
      }
  
      // ✅ This is what was missing:
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  // The value passed to the Provider gives access to the context's value
  const value = {
    currentUser,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
{children}
</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};