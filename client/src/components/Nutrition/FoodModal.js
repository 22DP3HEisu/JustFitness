import React, { useState, useEffect } from 'react';
import './nutrition.css';

const FoodModal = ({ food, onSave, onClose }) => {  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    is_public: true,
    serving_size: 100,
    serving_unit: 'g'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
    useEffect(() => {
    // If editing an existing food, populate the form
    if (food) {      setFormData({
        name: food.name || '',
        description: food.description || '',
        calories: food.calories || '',
        protein: food.protein || '',
        carbs: food.carbs || '',
        fat: food.fat || '',
        serving_size: food.serving_size || 100,
        serving_unit: food.serving_unit || 'g',
        is_public: food.is_public !== undefined ? food.is_public : true
      });
    }
  }, [food]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Allow empty string or valid numbers
    if (value === '' || !isNaN(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }
    
    if (formData.calories !== '' && (isNaN(formData.calories) || Number(formData.calories) < 0)) {
      newErrors.calories = 'Calories must be a positive number';
    }
    
    if (formData.protein !== '' && (isNaN(formData.protein) || Number(formData.protein) < 0)) {
      newErrors.protein = 'Protein must be a positive number';
    }
    
    if (formData.carbs !== '' && (isNaN(formData.carbs) || Number(formData.carbs) < 0)) {
      newErrors.carbs = 'Carbs must be a positive number';
    }
    
    if (formData.fat !== '' && (isNaN(formData.fat) || Number(formData.fat) < 0)) {
      newErrors.fat = 'Fat must be a positive number';
    }
    
    if (formData.serving_size !== '' && (isNaN(formData.serving_size) || Number(formData.serving_size) <= 0)) {
      newErrors.serving_size = 'Serving size must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert numeric fields to numbers
      const numericData = {
        ...formData,
        calories: formData.calories === '' ? 0 : Number(formData.calories),
        protein: formData.protein === '' ? 0 : Number(formData.protein),
        carbs: formData.carbs === '' ? 0 : Number(formData.carbs),
        fat: formData.fat === '' ? 0 : Number(formData.fat),
        serving_size: formData.serving_size === '' ? 1 : Number(formData.serving_size)
      };
      
      await onSave(numericData);
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{food ? 'Edit Food' : 'Create New Food'}</h2>
          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-group">
            <label htmlFor="name">Food Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Chicken Breast"
              required
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the food"
              rows="2"
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="calories">Calories</label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleNumberChange}
                placeholder="0"
                min="0"
              />
              {errors.calories && <div className="error-message">{errors.calories}</div>}
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="protein">Protein (g)</label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleNumberChange}
                placeholder="0"
                min="0"
                step="0.1"
              />
              {errors.protein && <div className="error-message">{errors.protein}</div>}
            </div>
          </div>
            <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="carbs">Carbs (g)</label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleNumberChange}
                placeholder="0"
                min="0"
                step="0.1"
              />
              {errors.carbs && <div className="error-message">{errors.carbs}</div>}
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="fat">Fat (g)</label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleNumberChange}
                placeholder="0"
                min="0"
                step="0.1"
              />
              {errors.fat && <div className="error-message">{errors.fat}</div>}
            </div>
          </div>
          
          <div className="form-group nutrition-note">
            <p>Note: All nutrition values are per 100 grams of the food.</p>
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
            />
            <label htmlFor="is_public">Make this food available to all users</label>
          </div>
          
          <div className="form-actions">
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
              {isLoading ? 'Saving...' : (food ? 'Update Food' : 'Create Food')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodModal;
