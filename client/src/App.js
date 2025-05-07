import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { UserContext } from './Contexts/UserContext';

import Start from './routes/start';
import Login from './routes/login';
import SignUp from './routes/signup';
import Profile from './routes/profile';
import Header from './Components/Header';
import PrivateRoute from './Components/PrivateRoute';

export default function App() {
    const {user, loading, error} = useContext(UserContext);

    console.log(user);
    
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
                              <Route path="/profile" element={<Profile user={user} />} />
                          </Routes>
                      </PrivateRoute>
                  }
              />
          </Routes>
      </div>
      </>
    );
  }