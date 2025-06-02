import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../Contexts/UserContext';
import { getFullMediaUrl } from '../../utils/mediaUtils';
import './ExerciseDetail.css';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/exercises/${id}`);
        setExercise(response.data);
      } catch (error) {
        console.error('Error fetching exercise:', error);
        toast.error('Could not load exercise details');
        // Navigate back to exercises if not found
        if (error.response && error.response.status === 404) {
          navigate('/exercises');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [id, navigate]);

  const handleMediaLoad = () => {
    setMediaLoaded(true);
  };

  const handleBackClick = () => {
    navigate('/exercises');
  };  const handleEditClick = () => {
    navigate(`/exercises?edit=${exercise.id}`);
  };

  const handleAddToWorkout = () => {
    // If we have a simple implementation, we can save to localStorage for now
    const selectedExercises = JSON.parse(localStorage.getItem('selectedExercises') || '[]');
    
    // Check if exercise is already selected
    if (selectedExercises.some(e => e.id === exercise.id)) {
      toast.info('This exercise is already in your workout selection');
      return;
    }
    
    // Add exercise to selected exercises
    selectedExercises.push({
      id: exercise.id,
      name: exercise.name,
      media_url: exercise.media_url,
      media_type: exercise.media_type
    });
    
    localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
    toast.success('Exercise added to your workout selection', {
      onClick: () => navigate('/create-workout'),
      closeButton: true,
      closeOnClick: false,
      autoClose: 5000,
      pauseOnHover: true
    });
  };

  if (isLoading) {
    return (
      <div className="exercise-detail-container">
        <div className="loading-message">Loading exercise details...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="exercise-detail-container">
        <div className="error-message">Exercise not found</div>
        <button className="back-button" onClick={handleBackClick}>
          Back to Exercises
        </button>
      </div>
    );
  }

  const canEdit = user && exercise.user_id === user.id;

  return (
    <div className="exercise-detail-container">
      <div className="exercise-detail-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Exercises
        </button>
        <h1 className="exercise-detail-title">{exercise.name}</h1>
        <div className="exercise-badge-container">
          <span className={`visibility-badge ${exercise.is_public ? 'public' : 'private'}`}>
            {exercise.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="exercise-detail-content">
        {/* Media section */}
        {exercise.media_url && (
          <div className={`exercise-detail-media ${mediaLoaded ? 'loaded' : ''}`}>
            <div className="loading-spinner"></div>
            {exercise.media_type === 'video' ? (
              <video 
                src={getFullMediaUrl(exercise.media_url)} 
                controls 
                className="exercise-media-item"
                onLoadedData={handleMediaLoad}
              />
            ) : (
              <img 
                src={getFullMediaUrl(exercise.media_url)} 
                alt={exercise.name} 
                className="exercise-media-item"
                onLoad={handleMediaLoad}
              />
            )}
          </div>
        )}

        {/* Description section */}
        <div className="exercise-detail-section">
          <h2 className="section-title">Description</h2>
          <div className="section-content">
            {exercise.description ? (
              <p className="exercise-description">{exercise.description}</p>
            ) : (
              <p className="no-content-message">No description available.</p>
            )}
          </div>
        </div>

        {/* Target muscles section */}
        <div className="exercise-detail-section">
          <h2 className="section-title">Target Muscle Groups</h2>
          <div className="section-content">
            {exercise.muscle_groups && exercise.muscle_groups.length > 0 ? (
              <div className="muscle-groups-container">
                {exercise.muscle_groups.map(group => (
                  <span key={group.id} className="muscle-group-tag large">
                    {group.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-content-message">No muscle groups specified.</p>
            )}
          </div>
        </div>

        {/* Creator info section */}
        {exercise.user && (
          <div className="exercise-detail-section">
            <h2 className="section-title">Created By</h2>
            <div className="section-content">
              <p className="creator-info">{exercise.user.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="exercise-detail-actions">
        {canEdit && (
          <button 
            className="edit-button"
            onClick={handleEditClick}
          >
            Edit Exercise
          </button>
        )}        <button 
          className="add-to-workout-button"
          onClick={handleAddToWorkout}
        >
          Add to Workout
        </button>
      </div>
    </div>
  );
};

export default ExerciseDetail;
