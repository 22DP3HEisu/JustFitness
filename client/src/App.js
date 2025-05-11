import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { UserContext } from './Contexts/UserContext';
import axios from "./lib/axios.js";

import Header from './routes/Header/Header';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from "./routes/AdminRoute";

import Start from './routes/Start/start';
import Login from './routes/Login/login';
import SignUp from './routes/SignUp/signup';
import Profile from './routes/Profile/profile';
import Workouts from './routes/Workouts/workouts';
import CreateWorkout from "./routes/CreateWorkout/createWorkout";
import AdminPage from "./routes/Admin/admin";

export default function App() {
    const {user, setUser} = useContext(UserContext);

    const handleLogout = () => {
        axios.post("/logout")
            .then(response => {
                // Clear the token from local storage
                window.localStorage.removeItem("token");
                // Reset the user context
                setUser(null);

                console.log("Logout successful:", response.data);
                
            })
            .catch(error => {
                console.error("Logout failed:", error);
            });
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
                    </PrivateRoute>
                  }
              />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Routes>
      </div>
      </>
    );
  }