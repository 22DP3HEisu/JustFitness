import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../Contexts/UserContext';
import NutritionContext, { NutritionProvider } from '../../Contexts/NutritionContext';
import './nutrition.css';
import FoodModal from './FoodModal';
import MealFoodModal from './MealFoodModal';
import NutritionSummary from './NutritionSummary';
import FoodsManagementModal from './FoodsManagementModal';

// Icons
const mealIcons = {
  breakfast: '☕',
  lunch: '🍲',
  dinner: '🍽️',
  snack: '🥪'
};

const NutritionContent = () => {
  const { user } = useContext(UserContext);
  const { selectedDate, setSelectedDate, formattedDate } = useContext(NutritionContext);
  
  const [mealLogs, setMealLogs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [foods, setFoods] = useState([]);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMealFoodModalOpen, setIsMealFoodModalOpen] = useState(false);
  const [isFoodsManagementModalOpen, setIsFoodsManagementModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedMealItem, setSelectedMealItem] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'summary'
  const [foodModalSource, setFoodModalSource] = useState(null); // 'meal', 'manage', or 'main'
  
  // Daily totals
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // Use memoized callback for fetchMealLogs to avoid dependency issues
  const fetchMealLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/meal-logs?date=${formattedDate}`);
      
      // Convert array to object organized by meal_type
      const mealLogsByType = {};
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      response.data.forEach(mealLog => {
        mealLogsByType[mealLog.meal_type] = mealLog;
        
        // Add to daily totals
        totalCalories += mealLog.total_calories || 0;
        totalProtein += mealLog.total_protein || 0;
        totalCarbs += mealLog.total_carbs || 0;
        totalFat += mealLog.total_fat || 0;
      });
      
      setMealLogs(mealLogsByType);
      setDailyTotals({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      });
    } catch (error) {
      console.error('Error fetching meal logs:', error);
      toast.error('Failed to load meal logs');
    } finally {
      setIsLoading(false);
    }
  }, [formattedDate]);

  const fetchFoods = useCallback(async () => {
    try {
      const response = await axios.get('/foods');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Failed to load food database');
    }
  }, []);

  useEffect(() => {
    fetchMealLogs();
    fetchFoods();
  }, [fetchMealLogs, fetchFoods]);

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleAddFood = (mealType) => {
    setSelectedMealType(mealType);
    setSelectedMealItem(null);
    setIsMealFoodModalOpen(true);
  };

  const handleEditMealItem = (mealType, mealItem) => {
    setSelectedMealType(mealType);
    setSelectedMealItem(mealItem);
    setIsMealFoodModalOpen(true);
  };
  const handleRemoveMealItem = async (mealType, itemId) => {
    if (!window.confirm('Are you sure you want to remove this food?')) {
      return;
    }
    
    try {
      const mealLog = mealLogs[mealType];
      
      // Filter out the item to remove
      const updatedItems = mealLog.items.filter(item => item.id !== itemId);
      
      // Update the meal log with the new items or delete if empty
      await axios.put(`/meal-logs/${mealLog.id}`, {
        items: updatedItems.map(item => ({
          food_id: item.food_id,
          quantity: item.quantity,
          measurement_unit: item.measurement_unit || 'g'
        }))
      });
      
      // If this was the last item, update UI immediately
      if (updatedItems.length === 0) {
        setMealLogs(prevLogs => {
          const newLogs = { ...prevLogs };
          delete newLogs[mealType];
          return newLogs;
        });
        
        // Also update daily totals
        setDailyTotals(prevTotals => {
          return {
            calories: prevTotals.calories - mealLog.total_calories,
            protein: prevTotals.protein - mealLog.total_protein,
            carbs: prevTotals.carbs - mealLog.total_carbs,
            fat: prevTotals.fat - mealLog.total_fat
          };
        });
      }
      
      toast.success('Food removed from meal');
      fetchMealLogs();
    } catch (error) {
      console.error('Error removing food from meal:', error);
      toast.error('Failed to remove food from meal');
    }
  };
  const handleSaveMealFood = async (mealType, foodData) => {
    try {
      const { foodId, quantity, measurement_unit } = foodData;
      
      // Check if we already have a meal log for this type
      if (mealLogs[mealType]) {
        const mealLog = mealLogs[mealType];
        let updatedItems;
        
        if (selectedMealItem) {
          // We're editing an existing item
          updatedItems = mealLog.items.map(item => 
            item.id === selectedMealItem.id 
              ? { food_id: foodId, quantity, measurement_unit } 
              : { 
                  food_id: item.food_id, 
                  quantity: item.quantity,
                  measurement_unit: item.measurement_unit || 'serving'
                }
          );
        } else {
          // We're adding a new item
          updatedItems = [
            ...mealLog.items.map(item => ({ 
              food_id: item.food_id, 
              quantity: item.quantity,
              measurement_unit: item.measurement_unit || 'serving'
            })),
            { food_id: foodId, quantity, measurement_unit }
          ];
        }
        
        // Update the meal log
        await axios.put(`/meal-logs/${mealLog.id}`, {
          items: updatedItems
        });
        
        toast.success(selectedMealItem ? 'Food updated' : 'Food added to meal');
      } else {
        // Create a new meal log
        await axios.post('/meal-logs', {
          date: formattedDate,
          meal_type: mealType,
          items: [{ food_id: foodId, quantity, measurement_unit }]
        });
        
        toast.success('Food added to meal');
      }
      
      setIsMealFoodModalOpen(false);
      fetchMealLogs();
    } catch (error) {
      console.error('Error saving meal food:', error);
      toast.error('Failed to save food to meal');
    }
  };  const handleCreateFood = () => {
    setSelectedFood(null);
    setFoodModalSource('main');
    setIsFoodModalOpen(true);
  };
  const handleEditFood = (food) => {
    setSelectedFood(food);
    setFoodModalSource('manage');
    setIsFoodModalOpen(true);
    // Close the food management modal when editing a food
    setIsFoodsManagementModalOpen(false);
  };
  const handleSaveFood = async (foodData) => {
    try {
      let response;
      
      if (selectedFood) {
        // Update existing food
        response = await axios.put(`/foods/${selectedFood.id}`, foodData);
        toast.success('Food updated successfully');
      } else {
        // Create new food
        response = await axios.post('/foods', foodData);
        toast.success('Food created successfully');
      }
      
      setIsFoodModalOpen(false);
      
      // Refresh foods list immediately
      await fetchFoods();
      
      return response.data;
    } catch (error) {
      console.error('Error saving food:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Show validation errors
        const validationErrors = error.response.data.errors;
        for (const key in validationErrors) {
          toast.error(validationErrors[key][0]);
        }
      } else {
        toast.error('Failed to save food');
      }
      
      throw error;
    }
  };  // Helper function to calculate nutrition values based on measurement units
  const calculateNutritionValue = (food, item, nutrientType = 'calories') => {
    if (!food || !item) return 0;
    
    const quantity = item.quantity;
    const unit = item.measurement_unit || 'g';
    
    // Convert to grams based on unit
    let grams = quantity;
    
    if (unit === 'oz') {
      grams = quantity * 28.35; // 1 oz = 28.35g
    } else if (unit === 'cup') {
      grams = quantity * 240; // ~240g per cup (approximate)
    } else if (unit === 'tbsp') {
      grams = quantity * 15; // ~15g per tablespoon
    } else if (unit === 'tsp') {
      grams = quantity * 5; // ~5g per teaspoon
    } else if (unit === 'ml') {
      grams = quantity; // 1ml water = ~1g
    } else if (unit === 'piece') {
      grams = quantity * 100; // Assuming a piece is roughly 100g
    } else if (unit !== 'g') {
      // If it's not a recognized unit and not grams, just use the quantity
      // This is a fallback for 'serving' or other custom units
      return food[nutrientType] * quantity;
    }
    
    // Calculate nutrition value based on grams and 100g standard
    return food[nutrientType] * (grams / 100);
  };

  // Render each meal section
  const renderMealSection = (mealType, title) => {
    const mealLog = mealLogs[mealType];
    const items = mealLog ? mealLog.items : [];
    
    return (
      <div className="meal-section">
        <div className="meal-header">
          <h3 className="meal-title">
            <span className="meal-icon">{mealIcons[mealType]}</span>
            {title}
          </h3>
          <button 
            className="add-food-button"
            onClick={() => handleAddFood(mealType)}
          >
            + Add Food
          </button>
        </div>
        
        {items.length > 0 ? (
          <div className="food-items-list">
            {items.map(item => (
              <div key={item.id} className="food-item">                <div className="food-info">
                  <div className="food-name">{item.food.name}</div>
                  <div className="food-details">                    <span className="food-quantity">
                      {item.quantity} {item.measurement_unit || 'g'}
                    </span>
                    <span>{Math.round(calculateNutritionValue(item.food, item, 'calories'))} calories</span>
                  </div>
                </div>
                <div className="food-actions">
                  <button 
                    className="edit-food-button"
                    onClick={() => handleEditMealItem(mealType, item)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="remove-food-button"
                    onClick={() => handleRemoveMealItem(mealType, item.id)}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {/* Show meal totals */}
            {items.length > 0 && (
              <div className="meal-summary">
                <div className="nutrient-stat">
                  <div className="nutrient-label">Calories</div>
                  <div className="nutrient-value calories-value">
                    {Math.round(mealLog.total_calories)}
                  </div>
                </div>
                <div className="nutrient-stat">
                  <div className="nutrient-label">Protein</div>
                  <div className="nutrient-value protein-value">
                    {Math.round(mealLog.total_protein)}g
                  </div>
                </div>
                <div className="nutrient-stat">
                  <div className="nutrient-label">Carbs</div>
                  <div className="nutrient-value carbs-value">
                    {Math.round(mealLog.total_carbs)}g
                  </div>
                </div>
                <div className="nutrient-stat">
                  <div className="nutrient-label">Fat</div>
                  <div className="nutrient-value fat-value">
                    {Math.round(mealLog.total_fat)}g
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-foods-message">
            No foods added to {title.toLowerCase()} yet.
          </div>
        )}
      </div>
    );
  };
  if (isLoading && viewMode === 'daily') {
    return (
      <div className="nutrition-container">
        <h1 className="nutrition-title">Nutrition Tracker</h1>
        <div className="loading-message">Loading nutrition data...</div>
      </div>
    );
  }

  return (
    <div className="nutrition-container">
      <h1 className="nutrition-title">Nutrition Tracker</h1>
      
      {/* View mode selector */}
      <div className="view-mode-selector">
        <button 
          className={`view-mode-button ${viewMode === 'daily' ? 'active' : ''}`}
          onClick={() => setViewMode('daily')}
        >
          Daily View
        </button>
        <button 
          className={`view-mode-button ${viewMode === 'summary' ? 'active' : ''}`}
          onClick={() => setViewMode('summary')}
        >
          Summary View
        </button>
      </div>
      
      {viewMode === 'daily' ? (
        <>
          {/* Date selector */}
          <div className="date-selector">
            <button onClick={() => handleDateChange(-1)}>Previous Day</button>
            <div className="current-date">{formatDisplayDate(selectedDate)}</div>
            <button onClick={() => handleDateChange(1)}>Next Day</button>
          </div>
          
          {/* Daily nutrition summary */}
          <div className="daily-summary">
            <h2 className="daily-summary-title">Daily Summary</h2>
            <div className="daily-summary-stats">
              <div className="daily-stat">
                <div className="daily-stat-value calories-value">{Math.round(dailyTotals.calories)}</div>
                <div className="daily-stat-label">Calories</div>
              </div>
              <div className="daily-stat">
                <div className="daily-stat-value protein-value">{Math.round(dailyTotals.protein)}g</div>
                <div className="daily-stat-label">Protein</div>
              </div>
              <div className="daily-stat">
                <div className="daily-stat-value carbs-value">{Math.round(dailyTotals.carbs)}g</div>
                <div className="daily-stat-label">Carbs</div>
              </div>
              <div className="daily-stat">
                <div className="daily-stat-value fat-value">{Math.round(dailyTotals.fat)}g</div>
                <div className="daily-stat-label">Fat</div>
              </div>
            </div>
          </div>
          
          {/* Meal sections */}
          {renderMealSection('breakfast', 'Breakfast')}
          {renderMealSection('lunch', 'Lunch')}
          {renderMealSection('dinner', 'Dinner')}
          {renderMealSection('snack', 'Snacks')}
            {/* Action buttons */}
          <div className="action-buttons">
            <button 
              className="create-food-button"
              onClick={handleCreateFood}
            >
              ➕ Create New Food
            </button>
            <button 
              className="create-food-button"
              onClick={() => setIsFoodsManagementModalOpen(true)}
            >
              🍽️ Manage Foods
            </button>
          </div>
            {/* Modals */}          {isFoodModalOpen && (
            <FoodModal
              food={selectedFood}
              onSave={async (foodData) => {
                const savedFood = await handleSaveFood(foodData);
                
                // After saving, determine where to go based on the source
                if (foodModalSource === 'meal') {
                  setIsFoodModalOpen(false);
                  setIsMealFoodModalOpen(true);
                } else if (foodModalSource === 'manage') {
                  setIsFoodModalOpen(false);
                  setIsFoodsManagementModalOpen(true);
                }
                
                return savedFood;
              }}
              onClose={() => {
                setIsFoodModalOpen(false);
                
                // When closing, go back to the appropriate modal based on source
                if (foodModalSource === 'meal') {
                  setIsMealFoodModalOpen(true);
                } else if (foodModalSource === 'manage') {
                  setIsFoodsManagementModalOpen(true);
                }
                // If source is 'main', we just close the modal without opening anything else
              }}
            />
          )}{isMealFoodModalOpen && (
            <MealFoodModal
              mealType={selectedMealType}
              mealItem={selectedMealItem}
              foods={foods}
              onSave={(foodData) => handleSaveMealFood(selectedMealType, foodData)}
              onClose={() => setIsMealFoodModalOpen(false)}              onCreateFood={() => {
                setIsMealFoodModalOpen(false);
                setSelectedFood(null);
                setFoodModalSource('meal');
                setIsFoodModalOpen(true);
              }}
            />
          )}
          
          {isFoodsManagementModalOpen && (
            <FoodsManagementModal
              foods={foods}
              onEdit={handleEditFood}
              onClose={() => setIsFoodsManagementModalOpen(false)}              onCreateFood={() => {
                setIsFoodsManagementModalOpen(false);
                setFoodModalSource('manage');
                handleCreateFood();
              }}
            />
          )}
        </>
      ) : (
        <NutritionSummary />
      )}
    </div>
  );
};

const Nutrition = () => {
  return (
    <NutritionProvider>
      <NutritionContent />
    </NutritionProvider>
  );
};

export default Nutrition;
