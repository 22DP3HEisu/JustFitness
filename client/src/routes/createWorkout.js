import React, { useState } from 'react';
import '../styles/workouts.css';

export default function CreateWorkout({ onCreate }) {
  const [newWorkout, setNewWorkout] = useState({ name: '', description: '' });

  const handleNewWorkoutChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorkout = () => {
    if (newWorkout.name && newWorkout.description) {
      onCreate(newWorkout); // Pass the new workout to the parent component or API
      setNewWorkout({ name: '', description: '' });
    }
  };

  return (
    <div className="workouts-container">
      <h1 className="workouts-title">Create New Workout</h1>
      <div className="new-workout-container">
        <input
          type="text"
          name="name"
          placeholder="Workout Name"
          value={newWorkout.name}
          onChange={handleNewWorkoutChange}
          className="new-workout-input"
        />
        <textarea
          name="description"
          placeholder="Workout Description"
          value={newWorkout.description}
          onChange={handleNewWorkoutChange}
          className="new-workout-textarea"
        ></textarea>
        <button onClick={handleCreateWorkout} className="create-workout-button">
          Create Workout
        </button>
      </div>
    </div>
  );
}