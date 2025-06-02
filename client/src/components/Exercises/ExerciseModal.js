import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getFullMediaUrl } from '../../utils/mediaUtils';
import './ExerciseModal.css';
import './media-upload.css';

const ExerciseModal = ({ exercise, muscleGroups, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedMuscleGroups: [],
    is_public: true,
    media: null,
    remove_media: false
  });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // Initialize form data when exercise prop changes
  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        selectedMuscleGroups: exercise.muscle_groups 
          ? exercise.muscle_groups.map(group => group.id) 
          : [],
        is_public: exercise.is_public !== undefined ? exercise.is_public : true,
        media: null,
        remove_media: false
      });
      
      // Set media preview if the exercise has media
      if (exercise.media_url) {
        setMediaPreview(exercise.media_url);
      } else {
        setMediaPreview(null);
      }
    } else {
      // Reset form for new exercise
      setFormData({
        name: '',
        description: '',
        selectedMuscleGroups: [],
        is_public: true,
        media: null,
        remove_media: false
      });
      setMediaPreview(null);
    }
  }, [exercise]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      if (!validTypes.includes(file.type) && !(file.type === 'image/jpg')) {
        setFileError('Invalid file type. Please upload JPEG, PNG, GIF, or MP4 files only.');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setFileError('File size exceeds 5MB limit. Please upload a smaller file.');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        media: file,
        remove_media: false
      }));
      
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };
  
  // Handle removing media
  const handleRemoveMedia = () => {
    setFormData(prev => ({
      ...prev,
      media: null,
      remove_media: exercise?.media_url ? true : false
    }));
    setMediaPreview(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle muscle group selection
  const handleMuscleGroupToggle = (muscleGroupId) => {
    setFormData(prev => {
      const currentSelected = [...prev.selectedMuscleGroups];
      
      if (currentSelected.includes(muscleGroupId)) {
        return {
          ...prev,
          selectedMuscleGroups: currentSelected.filter(id => id !== muscleGroupId)
        };
      } else {
        return {
          ...prev,
          selectedMuscleGroups: [...currentSelected, muscleGroupId]
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return; // Form validation is handled in the component
    }
    
    setIsLoading(true);
    
    try {      // Create FormData object to handle file uploads
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('description', formData.description || '');
      formDataToSubmit.append('is_public', formData.is_public ? '1' : '0');
      
      // Add muscle groups
      formData.selectedMuscleGroups.forEach((id, index) => {
        formDataToSubmit.append(`muscle_group_ids[${index}]`, id);
      });
      
      // Add media file if present
      if (formData.media) {
        formDataToSubmit.append('media', formData.media);
      }
        // Add remove_media flag if set
      if (formData.remove_media) {
        formDataToSubmit.append('remove_media', '1');
      }
      
      await onSave(formDataToSubmit);
    } catch (error) {
      console.error('Error in modal submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="exercise-modal-overlay">
      <div className="exercise-modal">
        <div className="exercise-modal-header">
          <h2>{exercise ? 'Edit Exercise' : 'Create New Exercise'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Exercise Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Bench Press"
              required
            />
          </div>
            <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the exercise, including proper form and techniques"
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="media">Media (Image, GIF, or Video)</label>
            <div className="media-upload-container">
              <input
                type="file"
                id="media"
                name="media"
                accept="image/jpeg,image/png,image/gif,video/mp4"
                onChange={handleFileChange}
                className="media-input"
                ref={fileInputRef}
              />
              <div className="media-preview-container">
                {mediaPreview && (
                  <div className="media-preview">
                    {exercise?.media_type === 'video' || (formData.media && formData.media.type.includes('video')) ? (
                      <video 
                        src={formData.media ? mediaPreview : getFullMediaUrl(mediaPreview)} 
                        controls 
                        className="media-preview-item"
                      />
                    ) : (
                      <img 
                        src={formData.media ? mediaPreview : getFullMediaUrl(mediaPreview)} 
                        alt="Exercise preview" 
                        className="media-preview-item"
                      />
                    )}
                    <button 
                      type="button" 
                      className="remove-media-btn"
                      onClick={handleRemoveMedia}
                    >
                      Remove
                    </button>
                  </div>
                )}                {!mediaPreview && (
                  <div className="media-upload-placeholder">
                    <p>Upload an image, GIF, or video (max 5MB)</p>
                    <p className="media-format-hint">Supported formats: JPEG, PNG, GIF, MP4</p>
                  </div>
                )}
                {fileError && (
                  <div className="media-error-message">
                    {fileError}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Target Muscle Groups</label>
            <div className="muscle-groups-grid">
              {muscleGroups.map(group => (
                <div 
                  key={group.id} 
                  className={`muscle-group-item ${formData.selectedMuscleGroups.includes(group.id) ? 'selected' : ''}`}
                  onClick={() => handleMuscleGroupToggle(group.id)}
                >
                  {group.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group visibility-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
              />
              Make this exercise public (visible to all users)
            </label>
          </div>
            <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (exercise ? 'Update Exercise' : 'Create Exercise')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ExerciseModal.propTypes = {
  exercise: PropTypes.object,
  muscleGroups: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ExerciseModal;
