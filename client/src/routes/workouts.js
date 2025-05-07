import React, { useState, useEffect } from 'react';
import '../styles/workouts.css';

export default function Workouts({ user }) {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [filter, setFilter] = useState('');
  const [newWorkout, setNewWorkout] = useState({ name: '', description: '' });

  useEffect(() => {
    // Fetch the user's workout plans (replace with actual API call)
    const fetchWorkouts = async () => {
      // Example data, replace with API response
      const exampleWorkouts = [
        { id: 1, name: 'Leg Day', description: 'A workout focused on legs.' },
        { id: 2, name: 'Cardio Blast', description: 'High-intensity cardio workout.' },
        { id: 3, name: 'Upper Body Strength', description: 'Focus on arms and chest.' },
      ];
      setWorkouts(exampleWorkouts);
      setFilteredWorkouts(exampleWorkouts);
    };

    fetchWorkouts();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilter(value);
    setFilteredWorkouts(
      workouts.filter((workout) =>
        workout.name.toLowerCase().includes(value) || workout.description.toLowerCase().includes(value)
      )
    );
  };

  const handleNewWorkoutChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorkout = () => {
    if (newWorkout.name && newWorkout.description) {
      const newWorkoutPlan = {
        id: workouts.length + 1, // Replace with actual ID from the backend
        name: newWorkout.name,
        description: newWorkout.description,
      };
      setWorkouts((prev) => [...prev, newWorkoutPlan]);
      setFilteredWorkouts((prev) => [...prev, newWorkoutPlan]);
      setNewWorkout({ name: '', description: '' });
    }
  };

  return (
    <div className="workouts-container">
      <h1 className="workouts-title">Workout Plans</h1>

        <div className="filter-container">
            <input
            type="text"
            placeholder="Filter workouts..."
            value={filter}
            onChange={handleFilterChange}
            className="filter-input"
            />
        </div>

        <div className="workouts-grid">
            {filteredWorkouts.map((workout) => (
                <button
                key={workout.id}
                className="workout-card"
                onClick={() => alert(`You clicked on ${workout.name}`)} // Replace with desired action
                >
                <h2>{workout.name}</h2>
                <p>{workout.description}</p>
                </button>
            ))}
        </div>
    </div>
  );
}