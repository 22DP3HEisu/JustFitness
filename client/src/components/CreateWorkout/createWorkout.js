import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../Contexts/UserContext';
import './createWorkout.css';

const CreateWorkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Add Exercises, 3: Preview
  
  // Basic workout information
  const [workoutInfo, setWorkoutInfo] = useState({
    name: '',
    description: ''
  });
    // Available exercises and muscle groups from API
  const [availableExercises, setAvailableExercises] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Selected exercises for the workout
  const [workoutExercises, setWorkoutExercises] = useState([]);
  
  // Current exercise being configured
  const [currentExercise, setCurrentExercise] = useState({
    exercise_id: '',
    sets: []
  });

  // Fetch exercises and muscle groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);      
      try {
        // Fetch exercises with their muscle groups
        const exercisesResponse = await axios.get('/exercises');
        setAvailableExercises(exercisesResponse.data);
        
        // Check for preselected exercises from localStorage
        const selectedExercises = JSON.parse(localStorage.getItem('selectedExercises') || '[]');
        if (selectedExercises.length > 0) {
          // If we have preselected exercises, go directly to step 2
          setStep(2);
          
          // Transform the selected exercises into the proper format
          const preselectedWorkoutExercises = selectedExercises.map(ex => ({
            exercise_id: ex.id,
            exercise: {
              id: ex.id,
              name: ex.name,
              media_url: ex.media_url,
              media_type: ex.media_type
            },
            sets: [{ reps: 10, weight: 0, rest: 60 }] // Default set
          }));
          
          setWorkoutExercises(preselectedWorkoutExercises);
          
          // Clear localStorage after using the data
          localStorage.removeItem('selectedExercises');
          
          toast.info('Added selected exercises to your workout');
        }
        
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load exercises and muscle groups');
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle changes to the basic workout info
  const handleWorkoutInfoChange = (e) => {
    const { name, value } = e.target;
    setWorkoutInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes to the current exercise being configured
  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'exercise_id') {
      const selectedExercise = availableExercises.find(ex => ex.id === parseInt(value));
      
      if (selectedExercise) {
        // Initialize with 3 sets by default
        setCurrentExercise({
          exercise_id: value,
          exercise_name: selectedExercise.name,
          exercise_description: selectedExercise.description,
          muscle_groups: selectedExercise.muscle_groups || [],
          sets: Array(3).fill().map(() => ({
            reps: 10,
            weight: 0,
            rest_time: 60
          }))
        });
      } else {
        setCurrentExercise({
          exercise_id: value,
          sets: []
        });
      }
    }
  };

  // Handle changes to an individual set
  const handleSetChange = (setIndex, field, value) => {
    setCurrentExercise(prev => {
      const updatedSets = [...prev.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value
      };
      return {
        ...prev,
        sets: updatedSets
      };
    });
  };

  // Add a new set to the current exercise
  const addSet = () => {
    setCurrentExercise(prev => ({
      ...prev,
      sets: [
        ...prev.sets,
        { reps: 10, weight: 0, rest_time: 60 }
      ]
    }));
  };

  // Remove a set from the current exercise
  const removeSet = (setIndex) => {
    if (currentExercise.sets.length <= 1) {
      toast.warning("You must have at least one set");
      return;
    }
    
    setCurrentExercise(prev => {
      const updatedSets = prev.sets.filter((_, index) => index !== setIndex);
      return {
        ...prev,
        sets: updatedSets
      };
    });
  };

  // Add the current exercise to the workout
  const addExerciseToWorkout = () => {
    if (!currentExercise.exercise_id) {
      toast.error('Please select an exercise');
      return;
    }
    
    const selectedExercise = availableExercises.find(ex => ex.id === parseInt(currentExercise.exercise_id));
    
    if (!selectedExercise) {
      toast.error('Invalid exercise selected');
      return;
    }
    
    if (currentExercise.sets.length === 0) {
      toast.error('Please configure at least one set');
      return;
    }
    
    setWorkoutExercises(prev => [...prev, {
      ...currentExercise,
      id: Date.now(), // Temporary id for frontend management
    }]);
    
    // Reset the current exercise form
    setCurrentExercise({
      exercise_id: '',
      sets: []
    });
    
    toast.success('Exercise added to workout');
  };

  // Edit an exercise in the workout
  const editExerciseInWorkout = (exerciseId) => {
    const exerciseToEdit = workoutExercises.find(ex => ex.id === exerciseId);
    
    if (exerciseToEdit) {
      // Remove the exercise from the workout list
      setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      
      // Set it as the current exercise for editing
      setCurrentExercise(exerciseToEdit);
    }
  };

  // Remove an exercise from the workout
  const removeExerciseFromWorkout = (exerciseId) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    toast.info('Exercise removed from workout');
  };

  // Move to the next step in the workflow
  const goToNextStep = () => {
    if (step === 1) {
      if (!workoutInfo.name.trim()) {
        toast.error('Please enter a workout name');
        return;
      }
    } else if (step === 2) {
      if (workoutExercises.length === 0) {
        toast.error('Please add at least one exercise to your workout');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  // Move to the previous step in the workflow
  const goToPreviousStep = () => {
    setStep(prev => prev - 1);
  };

  // Submit the workout to the server
  const handleSubmitWorkout = async () => {
    if (!workoutInfo.name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }
    
    if (workoutExercises.length === 0) {
      toast.error('Please add at least one exercise to your workout');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First create the workout
      const workoutResponse = await axios.post('/workouts', {
        name: workoutInfo.name,
        description: workoutInfo.description,
        user_id: user.id
      });
      
      const workoutId = workoutResponse.data.workout.id;
      
      // Then add each exercise to the workout
      for (const exercise of workoutExercises) {
        for (let i = 0; i < exercise.sets.length; i++) {
          const set = exercise.sets[i];
          await axios.post(`/workouts/${workoutId}/exercises`, {
            exercise_id: exercise.exercise_id,
            set_number: i + 1,
            reps: set.reps,
            weight: set.weight,
            rest_time: set.rest_time
          });
        }
      }
      
      toast.success('Workout created successfully!');
      navigate('/workouts'); // Navigate to the workouts page
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get muscle group names from an exercise
  const getMuscleGroupNames = (muscleGroups) => {
    return muscleGroups
      .map(group => group.name)
      .join(', ');
  };

  // Get all unique muscle groups targeted by the workout
  const getWorkoutMuscleGroups = () => {
    const muscleGroupMap = new Map();
    
    workoutExercises.forEach(exercise => {
      if (exercise.muscle_groups && exercise.muscle_groups.length > 0) {
        exercise.muscle_groups.forEach(group => {
          muscleGroupMap.set(group.id, group);
        });
      }
    });
    
    return Array.from(muscleGroupMap.values());
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="workouts-container">
        <h1 className="workouts-title">Create New Workout</h1>
        <div className="loading-message">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="workouts-container">
      <h1 className="workouts-title">Create New Workout</h1>
      
      {/* Progress indicator */}
      <div className="progress-bar">
        <div 
          className={`progress-step ${step >= 1 ? 'active' : ''}`}
          onClick={() => step > 1 && setStep(1)}
        >
          1. Basic Info
        </div>
        <div 
          className={`progress-step ${step >= 2 ? 'active' : ''}`}
          onClick={() => step > 2 && workoutInfo.name && setStep(2)}
        >
          2. Add Exercises
        </div>
        <div 
          className={`progress-step ${step >= 3 ? 'active' : ''}`}
        >
          3. Preview
        </div>
      </div>
      
      {/* Step 1: Basic Workout Information */}
      {step === 1 && (
        <div className="workout-step">
          <h2>Basic Workout Information</h2>
          <div className="form-group">
            <label htmlFor="name">Workout Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={workoutInfo.name}
              onChange={handleWorkoutInfoChange}
              placeholder="e.g., Upper Body Strength"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={workoutInfo.description}
              onChange={handleWorkoutInfoChange}
              placeholder="Describe your workout (goals, difficulty, etc.)"
              rows="4"
            ></textarea>
          </div>
          
          <div className="button-group">
            <button className="Button1" onClick={goToNextStep}>
              Next: Add Exercises
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Add Exercises */}
      {step === 2 && (
        <div className="workout-step">
          <h2>Add Exercises to Your Workout</h2>
          
          {/* Current exercises in workout */}
          {workoutExercises.length > 0 && (
            <div className="current-exercises">
              <h3>Current Exercises in This Workout</h3>
              <div className="exercise-list">
                {workoutExercises.map((exercise, index) => (
                  <div key={exercise.id} className="exercise-item">
                    <div className="exercise-header">
                      <span className="exercise-number">{index + 1}</span>
                      <h4>{exercise.exercise_name}</h4>
                      <div className="exercise-actions">
                        <button 
                          onClick={() => editExerciseInWorkout(exercise.id)}
                          className="edit-button"
                          title="Edit exercise"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => removeExerciseFromWorkout(exercise.id)}
                          className="remove-button"
                          title="Remove exercise"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="exercise-details">
                      <p>{exercise.exercise_description}</p>
                      {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                        <p><strong>Targets:</strong> {getMuscleGroupNames(exercise.muscle_groups)}</p>
                      )}
                      <div className="sets-summary">
                        <strong>{exercise.sets.length} sets:</strong>
                        {exercise.sets.map((set, idx) => (
                          <span key={idx} className="set-badge">
                            {set.reps} reps × {set.weight}kg ({set.rest_time}s rest)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new exercise form */}
          <div className="add-exercise-form">
            <h3>{currentExercise.exercise_id && currentExercise.id ? 'Edit Exercise' : 'Add Exercise'}</h3>
            
            <div className="form-group">
              <label htmlFor="exercise">Select Exercise *</label>
              <select
                id="exercise"
                name="exercise_id"
                value={currentExercise.exercise_id}
                onChange={handleExerciseChange}
                required
              >
                <option value="">Select an exercise</option>
                {availableExercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
            
            {currentExercise.exercise_id && (
              <>
                <h4>Configure Sets</h4>
                <div className="sets-container">
                  {currentExercise.sets.map((set, index) => (
                    <div key={index} className="set-item">
                      <div className="set-header">
                        <h5>Set {index + 1}</h5>
                        <button 
                          onClick={() => removeSet(index)}
                          className="remove-set-button"
                          title="Remove set"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="set-details">
                        <div className="set-input-group">
                          <label htmlFor={`reps-${index}`}>Reps</label>
                          <input
                            type="number"
                            id={`reps-${index}`}
                            min="1"
                            max="100"
                            value={set.reps}
                            onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="set-input-group">
                          <label htmlFor={`weight-${index}`}>Weight (kg)</label>
                          <input
                            type="number"
                            id={`weight-${index}`}
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, 'weight', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="set-input-group">
                          <label htmlFor={`rest-${index}`}>Rest (sec)</label>
                          <input
                            type="number"
                            id={`rest-${index}`}
                            min="0"
                            max="300"
                            value={set.rest_time}
                            onChange={(e) => handleSetChange(index, 'rest_time', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={addSet}
                    className="add-set-button"
                  >
                    + Add Another Set
                  </button>
                </div>
                
                <button 
                  onClick={addExerciseToWorkout}
                  className="add-exercise-button"
                >
                  {currentExercise.id ? 'Update Exercise' : 'Add to Workout'}
                </button>
              </>
            )}
          </div>
          
          <div className="button-group">
            <button className="Button1 secondary" onClick={goToPreviousStep}>
              Back
            </button>
            <button className="Button1" onClick={goToNextStep}>
              Next: Preview
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="workout-step">
          <h2>Preview Your Workout</h2>
          
          <div className="workout-preview">
            <div className="preview-header">
              <h3>{workoutInfo.name}</h3>
              <p>{workoutInfo.description}</p>
              
              {/* Show automatically derived target muscle groups */}
              {getWorkoutMuscleGroups().length > 0 && (
                <div className="workout-targets">
                  <h4>Target Muscle Groups:</h4>
                  <div className="muscle-groups-tags">
                    {getWorkoutMuscleGroups().map(group => (
                      <span key={group.id} className="muscle-group-tag">
                        {group.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="preview-exercises">
              <h4>Exercises:</h4>
              {workoutExercises.map((exercise, index) => (
                <div key={exercise.id} className="preview-exercise">
                  <div className="preview-exercise-header">
                    <span className="preview-exercise-number">{index + 1}</span>
                    <h5>{exercise.exercise_name}</h5>
                  </div>
                  <div className="preview-exercise-details">
                    <p>{exercise.exercise_description}</p>
                    
                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                      <div className="preview-muscle-groups">
                        <strong>Targets:</strong> {getMuscleGroupNames(exercise.muscle_groups)}
                      </div>
                    )}
                    
                    <div className="preview-sets">
                      <strong>Sets:</strong>
                      <div className="sets-table">
                        <div className="sets-header">
                          <span>Set</span>
                          <span>Reps</span>
                          <span>Weight</span>
                          <span>Rest</span>
                        </div>
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="set-row">
                            <span>{setIndex + 1}</span>
                            <span>{set.reps}</span>
                            <span>{set.weight} kg</span>
                            <span>{set.rest_time} sec</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="button-group">
            <button className="Button1 secondary" onClick={goToPreviousStep}>
              Back
            </button>
            <button 
              className="Button1" 
              onClick={handleSubmitWorkout}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Workout...' : 'Create Workout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkout;