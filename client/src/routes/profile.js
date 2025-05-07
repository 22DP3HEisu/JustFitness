import React from 'react'

export default function Profile({user}) {
  return (
    <div className="profile-container">
      <div className="profile-card">
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
      </div>
    </div>
  )
}
