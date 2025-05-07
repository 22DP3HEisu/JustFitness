import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { UserContext } from './Contexts/UserContext';

import Header from './Components/Header';
import PrivateRoute from './Components/PrivateRoute';

import Start from './routes/start';
import Login from './routes/login';
import SignUp from './routes/signup';
import Profile from './routes/profile';
import Workouts from './routes/workouts';
import CreateWorkout from "./routes/createWorkout";
import AdminRoute from "./Components/AdminRoute";

export default function App() {
    const {user, setUser} = useContext(UserContext);

    const handleLogout = () => {
        // Clear the token from local storage
        window.localStorage.removeItem("token");

        // Reset the user context
        setUser(null);

        // Optionally, you can also clear other user-related data if needed
        console.log("User logged out successfully");
    };

    return (
      <>
        <Header user={user} />
        <div className="MainContent">
          <Routes>
              <Route path="/" element={<Start />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                  path="/*"
                  element={
                      <PrivateRoute>
                          <Routes>
                              <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
                              <Route path="/workouts" element={<Workouts/>} />
                              <Route path="/create-workout" element={<CreateWorkout/>} />
                          </Routes>
                          <AdminRoute>
                                <Routes> <Route path="/admin" element={<h1>Admin Page</h1>} /> </Routes>
                          </AdminRoute>
                      </PrivateRoute>
                  }
              />
          </Routes>
      </div>
      </>
    );
  }