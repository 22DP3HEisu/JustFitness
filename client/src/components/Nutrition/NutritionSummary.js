import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../Contexts/UserContext';
import NutritionContext from '../../Contexts/NutritionContext';
import './nutrition.css';

const NutritionSummary = () => {
  const { user } = useContext(UserContext);
  const { formatDate } = useContext(NutritionContext);
  
  const [summaryData, setSummaryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date() // Today
  });
    const fetchSummaryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/meal-summary', {
        params: {
          start_date: formatDate(dateRange.startDate),
          end_date: formatDate(dateRange.endDate)
        }
      });
      
      setSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching nutrition summary:', error);
      toast.error('Failed to load nutrition summary');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, formatDate]);
  
  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };
    const calculateAverages = () => {
    if (!summaryData || Object.keys(summaryData).length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }
    
    // Filter out days with no nutrition data
    const validDays = Object.entries(summaryData)
      .filter(([_, dayData]) => {
        return dayData.total_calories > 0 || 
               dayData.total_protein > 0 || 
               dayData.total_carbs > 0 || 
               dayData.total_fat > 0;
      })
      .map(([date, _]) => date);
    
    if (validDays.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }
    
    const totals = validDays.reduce((acc, date) => {
      const dayData = summaryData[date];
      return {
        calories: acc.calories + dayData.total_calories,
        protein: acc.protein + dayData.total_protein,
        carbs: acc.carbs + dayData.total_carbs,
        fat: acc.fat + dayData.total_fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    const daysCount = validDays.length;
    return {
      calories: Math.round(totals.calories / daysCount),
      protein: Math.round(totals.protein / daysCount),
      carbs: Math.round(totals.carbs / daysCount),
      fat: Math.round(totals.fat / daysCount)
    };
  };
  
  const averages = calculateAverages();
  
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="nutrition-container">
        <h1 className="nutrition-title">Nutrition Summary</h1>
        <div className="loading-message">Loading nutrition summary data...</div>
      </div>
    );
  }
    // Get filtered days that have nutrition data
  const filteredDays = Object.entries(summaryData)
    .filter(([_, dayData]) => {
      // Only include days that have meals with nutrients
      return dayData.total_calories > 0 || 
             dayData.total_protein > 0 || 
             dayData.total_carbs > 0 || 
             dayData.total_fat > 0;
    })
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)); // Sort by date, newest first
    
  return (
    <div className="nutrition-container">
      <h1 className="nutrition-title">Nutrition Summary</h1>
      
      {/* Date range selector */}
      <div className="date-range-selector">
        <div className="date-input-group">
          <label htmlFor="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate"
            name="startDate"
            value={formatDate(dateRange.startDate)}
            onChange={handleDateChange}
            max={formatDate(dateRange.endDate)}
          />
        </div>
        
        <div className="date-input-group">
          <label htmlFor="endDate">End Date:</label>
          <input 
            type="date" 
            id="endDate"
            name="endDate"
            value={formatDate(dateRange.endDate)}
            onChange={handleDateChange}
            min={formatDate(dateRange.startDate)}
            max={formatDate(new Date())}
          />
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="summary-section">
        <h2 className="summary-title">Daily Averages</h2>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-value calories-value">{averages.calories}</div>
            <div className="summary-stat-label">Calories</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value protein-value">{averages.protein}g</div>
            <div className="summary-stat-label">Protein</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value carbs-value">{averages.carbs}g</div>
            <div className="summary-stat-label">Carbs</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value fat-value">{averages.fat}g</div>
            <div className="summary-stat-label">Fat</div>
          </div>
        </div>
      </div>
      
      {/* Daily breakdown */}
      <div className="daily-breakdown">
        <h2 className="summary-title">Daily Breakdown</h2>
          {filteredDays.length > 0 ? (
          <div className="daily-breakdown-list">
            {filteredDays.map(([date, dayData]) => (
                <div key={date} className="day-summary">
                  <div className="day-summary-header">
                    <h3 className="day-date">{formatDisplayDate(date)}</h3>
                    <div className="day-totals">
                      <span>{Math.round(dayData.total_calories)} calories</span>
                      <span>{Math.round(dayData.total_protein)}g protein</span>
                      <span>{Math.round(dayData.total_carbs)}g carbs</span>
                      <span>{Math.round(dayData.total_fat)}g fat</span>
                    </div>
                  </div>
                  
                  <div className="meal-breakdown">
                    {Object.entries(dayData.meals).map(([mealType, mealData]) => (
                      <div key={mealType} className="meal-summary-item">
                        <div className="meal-summary-type">
                          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </div>
                        <div className="meal-summary-nutrients">
                          <span>{Math.round(mealData.calories)} cal</span>
                          <span>{Math.round(mealData.protein)}g protein</span>
                          <span>{Math.round(mealData.carbs)}g carbs</span>
                          <span>{Math.round(mealData.fat)}g fat</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="no-data-message">
            No nutrition data available for the selected date range.
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionSummary;
