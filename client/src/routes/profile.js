import "../styles/profile.css";
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Call the logout function passed as a prop
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="profile-container">
        <h1 className="profile-title">Profile</h1>
        <div className="profile-details">
          <p><strong>Username:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Weight:</strong> {user.preferences?.weight} kg</p>
          <p><strong>Height:</strong> {user.preferences?.height} cm</p>
          <p><strong>Age:</strong> {user.preferences?.age}</p>
          <p><strong>Goal Weight:</strong> {user.preferences?.goal_weight} kg</p>
          <p><strong>Activity Level:</strong> {user.preferences?.activity_level}</p>
          <p><strong>Unit Preference:</strong> {user.preferences?.unit_preference}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
    </div>
  );
}