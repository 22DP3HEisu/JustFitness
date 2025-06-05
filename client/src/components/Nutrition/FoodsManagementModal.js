import React, { useState, useEffect } from 'react';
import './nutrition.css';

const FoodsManagementModal = ({ foods, onEdit, onClose, onCreateFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  
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
  
  return (
    <div className="modal-overlay">
      <div className="modal-content foods-management-modal">
        <div className="modal-header">
          <h2>Manage Foods</h2>          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>
        
        <div className="foods-management-content">
          <div className="foods-search">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search foods..."
              className="search-input"
            />
            <button 
              className="create-food-button"
              onClick={onCreateFood}
            >
              + Create New Food
            </button>
          </div>
          
          {filteredFoods.length > 0 ? (
            <div className="foods-list">
              <div className="foods-list-header">
                <div className="food-col food-name-col">Name</div>
                <div className="food-col food-nutrition-col">Nutrition (per serving)</div>
                <div className="food-col food-serving-col">Serving</div>
                <div className="food-col food-actions-col">Actions</div>
              </div>
              
              {filteredFoods.map(food => (
                <div key={food.id} className="food-row">
                  <div className="food-col food-name-col">
                    <div className="food-name">{food.name}</div>
                    {food.description && (
                      <div className="food-description">{food.description}</div>
                    )}
                  </div>
                  
                  <div className="food-col food-nutrition-col">
                    <div className="food-nutrition-item">
                      <span className="nutrition-label">Calories:</span>
                      <span className="nutrition-value calories-value">{food.calories}</span>
                    </div>
                    <div className="food-nutrition-item">
                      <span className="nutrition-label">Protein:</span>
                      <span className="nutrition-value protein-value">{food.protein}g</span>
                    </div>
                    <div className="food-nutrition-item">
                      <span className="nutrition-label">Carbs:</span>
                      <span className="nutrition-value carbs-value">{food.carbs}g</span>
                    </div>
                    <div className="food-nutrition-item">
                      <span className="nutrition-label">Fat:</span>
                      <span className="nutrition-value fat-value">{food.fat}g</span>
                    </div>
                  </div>
                  
                  <div className="food-col food-serving-col">
                    {food.serving_size} {food.serving_unit || 'serving(s)'}
                  </div>
                  
                  <div className="food-col food-actions-col">
                    <button 
                      className="edit-food-button"
                      onClick={() => onEdit(food)}
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-foods-message">
              No foods found. Create your first food by clicking the button above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodsManagementModal;
