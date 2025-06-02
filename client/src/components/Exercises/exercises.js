import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../Contexts/UserContext';
import { getFullMediaUrl } from '../../utils/mediaUtils';
import './exercises.css';
import './loading-spinner.css';
import ExerciseModal from './ExerciseModal';
import Tooltip from './Tooltip';

const Exercises = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [loadedMedia, setLoadedMedia] = useState({});
  
  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all'); // 'all', 'public', 'private'

  // Fetch exercises and muscle groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [exercisesResponse, muscleGroupsResponse] = await Promise.all([
          axios.get('/exercises'),
          axios.get('/muscle-groups')
        ]);
        
        setExercises(exercisesResponse.data);
        setMuscleGroups(muscleGroupsResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load exercises data');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Check for edit parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    
    if (editId && exercises.length > 0) {
      const exerciseToEdit = exercises.find(ex => ex.id.toString() === editId);
      if (exerciseToEdit) {
        handleOpenModal(exerciseToEdit);
      }
    }
  }, [location.search, exercises]);

  // Function to mark media as loaded
  const handleMediaLoad = (id) => {
    setLoadedMedia(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Handle opening the create/edit modal
  const handleOpenModal = (exercise = null) => {
    setCurrentExercise(exercise);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentExercise(null);
  };
  // Handle saving an exercise (create or update)
  const handleSaveExercise = async (exerciseData) => {
    try {
      let response;
      
      // Create headers for FormData (don't set Content-Type, let it be set automatically)
      const config = {
        headers: {
          'Accept': 'application/json'
        }
      };
      
      if (currentExercise) {
        // Update existing exercise
        response = await axios.post(`/exercises/${currentExercise.id}?_method=PUT`, exerciseData, config);
        
        setExercises(prevExercises => 
          prevExercises.map(ex => 
            ex.id === response.data.id ? response.data : ex
          )
        );
        
        toast.success('Exercise updated successfully!');
      } else {
        // Create new exercise
        response = await axios.post('/exercises', exerciseData, config);
        
        setExercises(prevExercises => [...prevExercises, response.data]);
        
        toast.success('Exercise created successfully!');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving exercise:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Show validation errors
        const validationErrors = error.response.data.errors;
        for (const key in validationErrors) {
          toast.error(validationErrors[key][0]);
        }
      } else {
        toast.error('Failed to save exercise');
      }
    }
  };
  // Handle deleting an exercise
  const handleDeleteExercise = async (exerciseId, userId) => {
    // Check if the exercise belongs to the current user
    if (userId && userId !== user.id) {
      toast.error('You can only delete your own exercises');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }
    
    try {
      await axios.delete(`/exercises/${exerciseId}`);
      
      setExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== exerciseId)
      );
      
      toast.success('Exercise deleted successfully!');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Failed to delete exercise');
    }
  };
    // Update renderExercise function to include loading spinner
const renderExerciseMedia = (exercise) => {
  if (!exercise.media_url) return null;
  
  return (
    <div className={`exercise-media ${loadedMedia[exercise.id] ? 'loaded' : ''}`}>
      <div className="loading-spinner"></div>
      {exercise.media_type === 'video' ? (
        <video
          src={getFullMediaUrl(exercise.media_url)}
          controls
          className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
          onLoadedData={() => handleMediaLoad(exercise.id)}
          loading="lazy"
        />
      ) : (
        <img
          src={getFullMediaUrl(exercise.media_url)}
          alt={exercise.name}
          className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
          onLoad={() => handleMediaLoad(exercise.id)}
          loading="lazy"
        />
      )}
    </div>
  );
};

  // Filter exercises based on current filter states
  const filteredExercises = exercises.filter(exercise => {
    // Filter by name
    if (filterName && !exercise.name.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    
    // Filter by muscle group
    if (filterMuscleGroup && !exercise.muscle_groups.some(group => 
      group.id.toString() === filterMuscleGroup
    )) {
      return false;
    }
    
    // Filter by visibility
    if (filterVisibility === 'public' && !exercise.is_public) {
      return false;
    }
    if (filterVisibility === 'private' && exercise.is_public) {
      return false;
    }
    
    return true;
  });

  // Get my exercises regardless of public/private status
  const myExercises = filteredExercises.filter(ex => 
    ex.user_id === user?.id
  );

  // Get public exercises created by other users
  const otherUsersPublicExercises = filteredExercises.filter(ex => 
    ex.is_public && ex.user_id !== user?.id
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="exercises-container">
        <h1 className="exercises-title">Exercises</h1>
        <div className="loading-message">Loading exercises...</div>
      </div>
    );
  }
  return (
    <div className="exercises-container">
      <h1 className="exercises-title">Exercises</h1>
      
      {/* Filter controls */}
      <div className="exercises-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={filterMuscleGroup} 
            onChange={(e) => setFilterMuscleGroup(e.target.value)}
            className="filter-select"
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups.map(group => (
              <option key={group.id} value={group.id.toString()}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            value={filterVisibility} 
            onChange={(e) => setFilterVisibility(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Exercises</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>
      </div>
      
      {/* Create exercise button */}
      <button 
        className="Button1 create-exercise-button"
        onClick={() => handleOpenModal()}
      >
        Create New Exercise
      </button>
      
      {/* My exercises section */}
      {user && myExercises.length > 0 && (
        <div className="exercises-section">
          <h2 className="section-title">
            My Exercises 
            <span className="exercise-count">
              ({myExercises.length})
            </span>
          </h2>
          <div className="exercises-grid">
            {myExercises.map(exercise => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-card-header">
                    <h3 className="exercise-name">{exercise.name}</h3>
                    <span className={`visibility-badge ${exercise.is_public ? 'public' : 'private'}`}>
                      {exercise.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                    {exercise.media_url && (
                    <div className={`exercise-media ${loadedMedia[exercise.id] ? 'loaded' : ''}`}>
                      {exercise.media_type === 'video' ? (
                        <video
                          src={getFullMediaUrl(exercise.media_url)}
                          controls
                          className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
                          onLoadedData={() => handleMediaLoad(exercise.id)}
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={getFullMediaUrl(exercise.media_url)}
                          alt={exercise.name}
                          className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
                          onLoad={() => handleMediaLoad(exercise.id)}
                          loading="lazy"
                        />
                      )}
                    </div>
                    )}
                  
                  <p className="exercise-description">
                    {exercise.description || 'No description available.'}
                  </p>
                  
                  <div className="exercise-muscle-groups">
                    <strong>Target Muscles:</strong>
                    <div className="muscle-groups-tags">
                      {exercise.muscle_groups.map(group => (
                        <span key={group.id} className="muscle-group-tag">
                          {group.name}
                        </span>
                      ))}
                      {exercise.muscle_groups.length === 0 && (
                        <span className="no-muscle-groups">None specified</span>
                      )}
                    </div>
                  </div>
                    <div className="exercise-actions">
                    <Link to={`/exercises/${exercise.id}`} className="view-details-button">
                      View Details
                    </Link>
                    <button 
                      className="Button2 edit-button"
                      onClick={() => handleOpenModal(exercise)}
                    >
                      Edit
                    </button>
                    <button 
                      className="Button3 delete-button"
                      onClick={() => handleDeleteExercise(exercise.id, exercise.user?.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Public exercises from other users section */}
      <div className="exercises-section">        
        <h2 className="section-title">
          Public Exercises
          <span className="exercise-count">
            ({otherUsersPublicExercises.length})
          </span>
        </h2>
        <div className="exercises-grid">
          {otherUsersPublicExercises.length > 0 ? (
            otherUsersPublicExercises.map(exercise => (
                  <div key={exercise.id} className="exercise-card">
                    <div className="exercise-card-header">
                      <h3 className="exercise-name">{exercise.name}</h3>
                      <span className="visibility-badge public">
                        Public
                      </span>
                    </div>
                      {exercise.media_url && (
                      <div className={`exercise-media ${loadedMedia[exercise.id] ? 'loaded' : ''}`}>
                        {exercise.media_type === 'video' ? (
                          <video
                            src={getFullMediaUrl(exercise.media_url)}
                            controls
                            className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
                            onLoadedData={() => handleMediaLoad(exercise.id)}
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={getFullMediaUrl(exercise.media_url)}
                            alt={exercise.name}
                            className={`exercise-media-item ${loadedMedia[exercise.id] ? 'loaded' : ''}`}
                            onLoad={() => handleMediaLoad(exercise.id)}
                            loading="lazy"
                          />
                        )}
                      </div>
                      )}
                    
                    {exercise.user && exercise.user.id !== (user ? user.id : null) && (
                      <div className="exercise-creator">
                        Created by: {exercise.user.name}
                      </div>
                    )}
                    
                    <p className="exercise-description">
                      {exercise.description || 'No description available.'}
                    </p>
                    
                    <div className="exercise-muscle-groups">
                      <strong>Target Muscles:</strong>
                      <div className="muscle-groups-tags">
                        {exercise.muscle_groups.map(group => (
                          <span key={group.id} className="muscle-group-tag">
                            {group.name}
                          </span>
                        ))}
                        {exercise.muscle_groups.length === 0 && (
                          <span className="no-muscle-groups">None specified</span>
                        )}
                      </div>
                    </div>
                      <div className="exercise-actions">
                      {exercise.user && exercise.user.id !== user?.id ? (
                        <>
                          <Link to={`/exercises/${exercise.id}`} className="view-details-button">
                            View Details
                          </Link>
                          <Tooltip text="You can only edit your own exercises">
                            <button 
                              className="Button2 edit-button"
                              disabled={true}
                            >
                              Edit
                            </button>
                          </Tooltip>
                          <Tooltip text="You can only delete your own exercises">
                            <button 
                              className="Button3 delete-button"
                              disabled={true}
                            >
                              Delete
                            </button>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Link to={`/exercises/${exercise.id}`} className="view-details-button">
                            View Details
                          </Link>
                          <button 
                            className="Button2 edit-button"
                            onClick={() => handleOpenModal(exercise)}
                          >
                            Edit
                          </button>
                          <button 
                            className="Button3 delete-button"
                            onClick={() => handleDeleteExercise(exercise.id, exercise.user?.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="no-exercises-message">
                No public exercises found matching your filters.
              </div>
            )}
        </div>
      </div>
      
      {/* Exercise create/edit modal */}
      {isModalOpen && (
        <ExerciseModal
          exercise={currentExercise}
          muscleGroups={muscleGroups}
          onSave={handleSaveExercise}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Exercises;
