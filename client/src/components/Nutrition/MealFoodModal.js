import React, { useState, useEffect } from 'react';
import './nutrition.css';

const MealFoodModal = ({ mealType, mealItem, foods, onSave, onClose, onCreateFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [measurementUnit, setMeasurementUnit] = useState('g'); // Default to grams
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Meal type display names
  const mealTypeNames = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks'
  };
  
  useEffect(() => {
    // If editing an existing meal item, set initial values
    if (mealItem) {
      setSelectedFoodId(mealItem.food_id.toString());
      setQuantity(mealItem.quantity);
      // If measurement unit is stored, use it, otherwise default to 'g'
      setMeasurementUnit(mealItem.measurement_unit || 'g');
    }
    
    // Initialize filtered foods
    setFilteredFoods(foods);
  }, [mealItem, foods]);
  
  // Filter foods based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFoods(foods);
      return;
    }
    
    const filtered = foods.filter(food => 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredFoods(filtered);
  }, [searchQuery, foods]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleFoodSelect = (e) => {
    setSelectedFoodId(e.target.value);
    
    // Clear error if exists
    if (errors.foodId) {
      setErrors({
        ...errors,
        foodId: null
      });
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Allow valid numbers only
    if (value === '' || (!isNaN(value) && Number(value) > 0)) {
      setQuantity(value);
      
      // Clear error if exists
      if (errors.quantity) {
        setErrors({
          ...errors,
          quantity: null
        });
      }
    }
  };
  
  const handleMeasurementUnitChange = (e) => {
    setMeasurementUnit(e.target.value);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedFoodId) {
      newErrors.foodId = 'Please select a food';
    }
    
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave({
      foodId: Number(selectedFoodId),
      quantity: Number(quantity),
      measurement_unit: measurementUnit
    });
  };
    // Get selected food details for display
  const selectedFood = selectedFoodId ? foods.find(f => f.id.toString() === selectedFoodId) : null;
  
  // Unit conversions for display and calculations
  const convertToGrams = (quantity, unit) => {
    if (unit === 'g') return quantity;
    
    // Convert other units to grams
    if (unit === 'oz') return quantity * 28.35; // 1 oz = 28.35g
    
    // For other units, we'll need to estimate or use standard conversions
    // These are approximations and may vary by food density
    if (unit === 'cup') return quantity * 240; // ~240g per cup (very approximate)
    if (unit === 'tbsp') return quantity * 15; // ~15g per tablespoon
    if (unit === 'tsp') return quantity * 5;   // ~5g per teaspoon
    if (unit === 'ml') return quantity;        // 1ml water = ~1g
    if (unit === 'piece') return quantity * 100; // Assuming a piece is roughly 100g
    
    // Default fallback
    return quantity;
  };
    // Calculate nutrition values based on portion size (per 100g standard)
  const calculateNutritionValue = (baseValue, quantity, unit) => {
    if (!baseValue) return 0;
    
    // Convert to grams first, then calculate proportion of 100g
    const grams = convertToGrams(Number(quantity), unit);
    return baseValue * (grams / 100);
  };
  
  // Handler for Create Food button
  const handleCreateFoodClick = () => {
    if (onCreateFood && typeof onCreateFood === 'function') {
      onCreateFood();
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mealItem ? 'Edit Food' : 'Add Food to'} {mealTypeNames[mealType]}</h2>
          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="meal-food-form">
          <div className="form-group">
            <label htmlFor="searchFood">Search Foods</label>
            <input
              type="text"
              id="searchFood"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for foods..."
              className="search-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="foodSelect">Select Food*</label>
            <select
              id="foodSelect"
              value={selectedFoodId}
              onChange={handleFoodSelect}
              required
              className="food-select"
            >
              <option value="">-- Select a food --</option>
              {filteredFoods.map(food => (
                <option key={food.id} value={food.id.toString()}>
                  {food.name} ({food.calories} cal per 100g)
                </option>
              ))}
            </select>
            {errors.foodId && <div className="error-message">{errors.foodId}</div>}
              {filteredFoods.length === 0 && (
              <div className="no-foods-message">
                No foods found. 
                <button 
                  type="button"
                  className="create-food-link"
                  onClick={handleCreateFoodClick}
                >
                  Create a new food
                </button>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Portion Size*</label>
            <div className="quantity-unit-container">
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="0.1"
                step="0.1"
                required
                className="quantity-input"
              />
              <select
                id="measurement_unit"
                value={measurementUnit}
                onChange={handleMeasurementUnitChange}
                className="measurement-unit-select"
              >
                <option value="g">grams</option>
                <option value="oz">ounces</option>
                <option value="cup">cup(s)</option>
                <option value="tbsp">tablespoon(s)</option>
                <option value="tsp">teaspoon(s)</option>
                <option value="ml">milliliters</option>
                <option value="piece">piece(s)</option>
              </select>
            </div>
            {errors.quantity && <div className="error-message">{errors.quantity}</div>}
          </div>
          
          {/* Show nutrition preview if a food is selected */}
          {selectedFood && (
            <div className="nutrition-preview">
              <h3>Nutrition Preview</h3>
              <div className="preview-nutrients">
                <div className="preview-nutrient">
                  <span>Calories:</span>
                  <span className="preview-value">
                    {Math.round(calculateNutritionValue(selectedFood.calories, Number(quantity), measurementUnit))} cal
                  </span>
                </div>
                <div className="preview-nutrient">
                  <span>Protein:</span>
                  <span className="preview-value">
                    {calculateNutritionValue(selectedFood.protein, Number(quantity), measurementUnit).toFixed(1)}g
                  </span>
                </div>
                <div className="preview-nutrient">
                  <span>Carbs:</span>
                  <span className="preview-value">
                    {calculateNutritionValue(selectedFood.carbs, Number(quantity), measurementUnit).toFixed(1)}g
                  </span>
                </div>
                <div className="preview-nutrient">
                  <span>Fat:</span>
                  <span className="preview-value">
                    {calculateNutritionValue(selectedFood.fat, Number(quantity), measurementUnit).toFixed(1)}g
                  </span>
                </div>
              </div>
              <div className="serving-info">
                <p>Note: Nutrition facts are per 100g of food. Your portion: {quantity} {measurementUnit}</p>
              </div>
            </div>
          )}
            <div className="form-actions">
            <button 
              type="button" 
              className="create-food-button"
              onClick={handleCreateFoodClick}
            >
              Create New Food
            </button>
            <div className="modal-buttons">
              <button 
                type="button" 
                className="cancel-button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
              >
                {mealItem ? 'Update' : 'Add to Meal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealFoodModal;
