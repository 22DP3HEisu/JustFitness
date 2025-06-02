import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axios.js';
import { toast } from 'react-toastify';
import './workouts.css';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState({
    name: '',
    description: ''
  });
  useEffect(() => {
    fetchWorkout();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Note: We're disabling the eslint rule because including fetchWorkout in the dependency array
  // would cause an infinite re-render loop since fetchWorkout is defined inside the component

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/workouts/${id}`);
      setWorkout(response.data);
      setEditedWorkout({
        name: response.data.name,
        description: response.data.description
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Failed to load workout details');
      setLoading(false);
      navigate('/workouts');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedWorkout({
      name: workout.name,
      description: workout.description
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedWorkout(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!editedWorkout.name.trim()) {
      toast.error('Workout name cannot be empty');
      return;
    }

    try {
      await axios.put(`/workouts/${id}`, {
        name: editedWorkout.name,
        description: editedWorkout.description
      });
      setIsEditing(false);
      fetchWorkout();
      toast.success('Workout updated successfully');
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
    }
  };

  const handleDeleteWorkout = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`/workouts/${id}`);
        toast.success('Workout deleted successfully');
        navigate('/workouts');
      } catch (error) {
        console.error('Error deleting workout:', error);
        toast.error('Failed to delete workout');
      }
    }
  };

  const handleRemoveExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to remove this exercise from the workout?')) {
      try {
        await axios.delete(`/workouts/${id}/exercises/${exerciseId}`);
        toast.success('Exercise removed from workout');
        fetchWorkout();
      } catch (error) {
        console.error('Error removing exercise:', error);
        toast.error('Failed to remove exercise');
      }
    }
  };  const handleUpdateExerciseSets = async (exerciseId, sets) => {
    try {
      // Update all sets for this exercise
      for (const set of sets) {
        await axios.put(`/workouts/${id}/exercises/${exerciseId}/sets/${set.set_number}`, {
          reps: set.reps,
          weight: set.weight,
          rest_time: set.rest_time
        });
      }
      toast.success('Exercise sets updated successfully');
      fetchWorkout();
    } catch (error) {
      console.error('Error updating exercise sets:', error);
      toast.error('Failed to update exercise sets');
    }
  };const handleEditExerciseSet = (exerciseId, setNumber, field, value) => {
    const updatedWorkout = { ...workout };
    
    // Update all instances of this exercise in the array
    updatedWorkout.exercises = updatedWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const sets = getSetsFromExercise(exercise);
        const setIndex = sets.findIndex(set => set.set_number === setNumber);
        
        if (setIndex !== -1) {
          if (Array.isArray(exercise.pivot)) {
            // If pivot is already an array, update directly
            exercise.pivot[setIndex][field] = value;
          } else if (exercise.pivot && !Array.isArray(exercise.pivot)) {
            // If pivot is an object and it's the matching set
            if (exercise.pivot.set_number === setNumber) {
              exercise.pivot[field] = value;
            }
          }
        }
      }
      return exercise;
    });
    
    setWorkout(updatedWorkout);
  };

  const handleBack = () => {
    navigate('/workouts');
  };
  const handleStartWorkout = () => {
    // This would navigate to a workout session page in a future implementation
    toast.info('Workout session feature coming soon!');
  };

  const handleAddSet = async (exerciseId) => {
    const updatedWorkout = { ...workout };
    const exerciseIndex = updatedWorkout.exercises.findIndex(ex => ex.id === exerciseId);
    
    if (exerciseIndex !== -1) {
      const exercise = updatedWorkout.exercises[exerciseIndex];
      const sets = getSetsFromExercise(exercise);
      
      // Find the highest set number to determine the next set number
      let highestSetNumber = 0;
      sets.forEach(set => {
        if (set.set_number > highestSetNumber) {
          highestSetNumber = set.set_number;
        }
      });
      
      const newSetNumber = highestSetNumber + 1;
      
      try {
        // Call the API to add a new set
        await axios.post(`/workouts/${id}/exercises`, {
          exercise_id: exerciseId,
          set_number: newSetNumber,
          reps: 8, // Default values
          weight: 0,
          rest_time: 60
        });
        
        toast.success('New set added successfully');
        fetchWorkout(); // Refresh the workout data
      } catch (error) {
        console.error('Error adding new set:', error);
        toast.error('Failed to add new set');
      }
    }
  };

  if (loading) {
    return (
      <div className="workouts-container">
        <div className="loading-container">
          <p>Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="workouts-container">
        <div className="error-container">
          <p>Workout not found.</p>
          <button className="Button1" onClick={handleBack}>Back to Workouts</button>
        </div>
      </div>
    );
  }

  // Group exercises by muscle groups for the summary
  const getMuscleGroupsFromExercises = () => {
    const muscleGroups = new Set();
    workout.exercises.forEach(exercise => {
      if (exercise.muscle_groups) {
        exercise.muscle_groups.forEach(group => {
          muscleGroups.add(group.name);
        });
      }
    });
    return Array.from(muscleGroups);
  };

  // Helper function to handle different pivot structures
  const getSetsFromExercise = (exercise) => {
    // If pivot is not an array but an object, wrap it in an array
    if (exercise.pivot && !Array.isArray(exercise.pivot)) {
      return [exercise.pivot];
    }
    // If it's already an array, return it
    else if (Array.isArray(exercise.pivot)) {
      return exercise.pivot;
    }
    // Fallback: return empty array
    return [];
  };

  return (
    <div className="workouts-container">
      <button className="back-button" onClick={handleBack}>
        &larr; Back to Workouts
      </button>

      <div className="workout-detail-header">
        {isEditing ? (
          <div className="edit-workout-form">
            <div className="form-group">
              <label htmlFor="name">Workout Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedWorkout.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={editedWorkout.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            <div className="button-group">
              <button className="Button1" onClick={handleSaveChanges}>Save Changes</button>
              <button className="Button1 secondary" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="workout-title-section">
              <h1 className="workout-detail-title">{workout.name}</h1>
              <div className="workout-actions">
                <button className="edit-workout-btn" onClick={handleEditClick}>Edit</button>
                <button className="delete-workout-btn" onClick={handleDeleteWorkout}>Delete</button>
              </div>
            </div>
            {workout.description && (
              <p className="workout-description">{workout.description}</p>
            )}
          </>
        )}

        <div className="workout-summary">
          <div className="summary-item">
            <span className="summary-label">Sets:</span>
            <span className="summary-value">{workout.exercises.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Target Muscles:</span>
            <div className="muscle-groups-list">
              {getMuscleGroupsFromExercises().map((group, index) => (
                <span key={index} className="muscle-group-tag">{group}</span>
              ))}
            </div>
          </div>
        </div>

        <button className="start-workout-btn Button1" onClick={handleStartWorkout}>
          Start Workout
        </button>
      </div>      <div className="workout-exercises-section">
        <h2>Exercises</h2>
        {workout.exercises.length > 0 ? (
          <div className="workout-exercises-list">
            {/* Group exercises by exercise ID */}
            {(() => {
              // Create a map to group exercises by their ID
              const exerciseMap = {};
              
              // Group exercises by their ID
              workout.exercises.forEach(exercise => {
                const id = exercise.id;
                
                if (!exerciseMap[id]) {
                  // Initialize a new exercise entry
                  exerciseMap[id] = {
                    ...exercise,
                    allSets: []
                  };
                }
                
                // Add set information to the exercise
                const sets = getSetsFromExercise(exercise);
                exerciseMap[id].allSets = [...exerciseMap[id].allSets, ...sets];
              });
              
              // Convert the map to an array and render
              return Object.values(exerciseMap).map((exercise, index) => (
                <div key={exercise.id} className="workout-exercise-card">
                  <div className="exercise-header">
                    <span className="exercise-number">{index + 1}</span>
                    <h3>{exercise.name}</h3>
                    <button 
                      className="remove-exercise-btn"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      title="Remove exercise from workout"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="exercise-content">
                    <p className="exercise-description">{exercise.description}</p>
                    
                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                      <div className="exercise-muscle-groups">
                        <strong>Target muscles:</strong> {exercise.muscle_groups.map(group => group.name).join(', ')}
                      </div>                    )}
                      <div className="exercise-sets">
                      <h4>Sets</h4>
                      <div className="sets-grid">
                        <div className="sets-header">
                          <div className="set-cell">Set</div>
                          <div className="set-cell">Reps</div>
                          <div className="set-cell">Weight (kg)</div>
                          <div className="set-cell">Rest (sec)</div>
                        </div>
                        
                        {/* Sort sets by set number */}
                        {exercise.allSets.sort((a, b) => a.set_number - b.set_number).map((set) => (
                          <div key={set.set_number} className="set-row">
                            <div className="set-cell">{set.set_number}</div>
                            <div className="set-cell">
                              <input
                                type="number"
                                className="set-input"
                                value={set.reps}
                                onChange={(e) => handleEditExerciseSet(
                                  exercise.id, 
                                  set.set_number, 
                                  'reps', 
                                  parseInt(e.target.value) || 0
                                )}
                                min="1"
                              />
                            </div>
                            <div className="set-cell">
                              <input
                                type="number"
                                className="set-input"
                                value={set.weight}
                                onChange={(e) => handleEditExerciseSet(
                                  exercise.id, 
                                  set.set_number, 
                                  'weight', 
                                  parseFloat(e.target.value) || 0
                                )}
                                min="0"
                                step="0.5"
                              />
                            </div>
                            <div className="set-cell">
                              <input
                                type="number"
                                className="set-input"
                                value={set.rest_time}
                                onChange={(e) => handleEditExerciseSet(
                                  exercise.id, 
                                  set.set_number, 
                                  'rest_time', 
                                  parseInt(e.target.value) || 0
                                )}
                                min="0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="sets-actions">
                        <button 
                          className="add-set-btn"
                          onClick={() => handleAddSet(exercise.id)}
                        >
                          + Add Set
                        </button>
                        <button 
                          className="update-exercise-btn"
                          onClick={() => handleUpdateExerciseSets(
                            exercise.id,
                            exercise.allSets
                          )}
                        >
                          Update Exercise
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="no-exercises">
            <p>No exercises in this workout yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
