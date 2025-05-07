import React, { createContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      axios.get("/user")
        .then(({ data }) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          setError("Failed to load user data.");
          setLoading(false);
        });
    } else {
      setError("No token found. Please log in.");
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
}