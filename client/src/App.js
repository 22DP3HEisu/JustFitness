import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { UserContext } from './Contexts/UserContext';
import axios from "./lib/axios.js";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navigation from './components/Navigation/Navigation.js';
import PrivateRoute from './components/PrivateRoute.js';
import AdminRoute from "./components/AdminRoute.js";

import Start from './components/Start/start.js';
import Login from './components/Login/login.js';
import SignUp from './components/SignUp/signup.js';
import Profile from './components/Profile/profile.js';
import Workouts from './components/Workouts/workouts.js';
import CreateWorkout from "./components/CreateWorkout/createWorkout.js";
import WorkoutDetail from "./components/Workouts/WorkoutDetail.js";
import Exercises from "./components/Exercises/exercises.js";
import ExerciseDetail from "./components/Exercises/ExerciseDetail.js";
import AdminPage from "./components/Admin/admin.js";
import MuscleGroups from './components/MuscleGroups/muscleGroups.js';

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
            });    };    
        return (
      <div className="App">
        <Navigation user={user} />
        <div className="MainContent">
          <Routes>
              <Route path="/" element={<Start />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/muscle-groups" element={<MuscleGroups />} />
              <Route
                  path="/*"
                  element={                    <PrivateRoute>                      <Routes>                        <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />                        <Route path="/workouts" element={<Workouts />} />
                        <Route path="/workouts/:id" element={<WorkoutDetail />} />
                        <Route path="/create-workout" element={<CreateWorkout />} />
                        <Route path="/exercises" element={<Exercises />} />
                        <Route path="/exercises/:id" element={<ExerciseDetail />} />
                        <Route path="/create-exercise" element={<Navigate to="/exercises" replace />} />
                      </Routes>
                    </PrivateRoute>
                  }              />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />          
          </Routes></div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    );
  }