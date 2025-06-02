import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios.js';
import { toast } from 'react-toastify';
import './workouts.css';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchWorkouts();
    fetchMuscleGroups();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/workouts');
      setWorkouts(response.data);
      setFilteredWorkouts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
      setLoading(false);
    }
  };
  
  const fetchMuscleGroups = async () => {
    try {
      const response = await axios.get('/muscle-groups');
      setMuscleGroups(response.data);
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
      toast.error('Failed to load muscle groups');
    }
  };
  useEffect(() => {
    // Apply filter and sorting whenever workouts, filter, sortBy, or selectedMuscleGroup changes
    let result = [...workouts];
    
    // Apply text filter
    if (filter) {
      const lowercaseFilter = filter.toLowerCase();
      result = result.filter((workout) =>
        workout.name.toLowerCase().includes(lowercaseFilter) || 
        workout.description.toLowerCase().includes(lowercaseFilter)
      );
    }
    
    // Apply muscle group filter
    if (selectedMuscleGroup) {
      result = result.filter(workout => {
        // Check if any exercise in this workout targets the selected muscle group
        if (!workout.exercises) return false;
        
        return workout.exercises.some(exercise => {
          if (!exercise.muscle_groups) return false;
          return exercise.muscle_groups.some(group => group.id === parseInt(selectedMuscleGroup));
        });
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'exercises':
          return (b.exercises?.length || 0) - (a.exercises?.length || 0);
        case 'date':
          // Sort by created_at date (newest first)
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });
    
    setFilteredWorkouts(result);
  }, [workouts, filter, sortBy, selectedMuscleGroup]);  const handleWorkoutClick = (workoutId) => {
    navigate(`/workouts/${workoutId}`);
  };

  const handleCreateWorkoutClick = () => {
    navigate('/create-workout');
  };
  
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    // Filtering is handled by the useEffect
  };
  
  const handleMuscleGroupChange = (e) => {
    const value = e.target.value;
    setSelectedMuscleGroup(value);
    // Filtering is handled by the useEffect
  };
  
  const handleDeleteWorkout = async (e, workoutId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`/workouts/${workoutId}`);
        toast.success('Workout deleted successfully');
        fetchWorkouts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting workout:', error);
        toast.error('Failed to delete workout');
      }
    }
  };

  // Calculate an estimated workout duration based on exercises and rest times
  const calculateWorkoutDuration = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) {
      return 'N/A';
    }
      let totalSeconds = 0;
    
    // Helper function to get sets from an exercise
    const getSetsFromExercise = (exercise) => {
      if (exercise.pivot && !Array.isArray(exercise.pivot)) {
        return [exercise.pivot];
      } else if (Array.isArray(exercise.pivot)) {
        return exercise.pivot;
      }
      return [];
    };
    
    // Sum up all rest times from the workout
    workout.exercises.forEach(exercise => {
      const sets = getSetsFromExercise(exercise);
      if (sets.length > 0) {
        sets.forEach(set => {
          // Add rest time for each set
          totalSeconds += set.rest_time || 0;
          
          // Estimate exercise time (approximately 3-5 seconds per rep)
          totalSeconds += (set.reps || 0) * 4;
        });
      }
    });
    
    // Convert to minutes
    const minutes = Math.ceil(totalSeconds / 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Format the muscle groups targeted by a workout
  const getWorkoutMuscleGroups = (workout) => {
    if (!workout.exercises) return [];
    
    const muscleGroupMap = new Map();
    
    workout.exercises.forEach(exercise => {
      if (exercise.muscle_groups && exercise.muscle_groups.length > 0) {
        exercise.muscle_groups.forEach(group => {
          muscleGroupMap.set(group.id, group.name);
        });
      }
    });
    
    return Array.from(muscleGroupMap.values());
  };

  return (
    <div className="workouts-container">
      <h1 className="workouts-title">My Workouts</h1>      <div className="workouts-actions">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Search workouts..."
            value={filter}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        
        <div className="sort-container">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="exercises">Sort by Exercises</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
        
        <div className="muscle-group-container">
          <select 
            value={selectedMuscleGroup}
            onChange={handleMuscleGroupChange}
            className="muscle-group-select"
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className="Button1 create-workout-btn"
          onClick={handleCreateWorkoutClick}
        >
          Create New Workout
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading workouts...</p>
        </div>
      ) : filteredWorkouts.length > 0 ? (
        <div className="workouts-grid">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="workout-card"
              onClick={() => handleWorkoutClick(workout.id)}
            >              <h2>{workout.name}</h2>
              <p className="workout-description">{workout.description || 'No description'}</p>
              
              {getWorkoutMuscleGroups(workout).length > 0 && (
                <div className="workout-muscle-groups">
                  {getWorkoutMuscleGroups(workout).slice(0, 3).map((group, idx) => (
                    <span key={idx} className="muscle-group-tag">{group}</span>
                  ))}
                  {getWorkoutMuscleGroups(workout).length > 3 && (
                    <span className="more-tag">+{getWorkoutMuscleGroups(workout).length - 3} more</span>
                  )}
                </div>
              )}
              
              <div className="workout-info">
                <div className="info-item">
                  <span className="info-label">Exercises:</span>
                  <span className="info-value">{workout.exercises ? workout.exercises.length : 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{calculateWorkoutDuration(workout)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">{new Date(workout.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                className="delete-workout-btn"
                onClick={(e) => handleDeleteWorkout(e, workout.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-workouts">
          <p>No workouts found. Create your first workout to get started!</p>
        </div>
      )}
    </div>
  );
}