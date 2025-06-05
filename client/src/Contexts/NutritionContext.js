import { createContext, useState } from 'react';

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
  const [dailyMeals, setDailyMeals] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Format date for API requests
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Get formatted date for current selection
  const formattedDate = formatDate(selectedDate);
  
  const value = {
    dailyMeals,
    setDailyMeals,
    selectedDate,
    setSelectedDate,
    formattedDate,
    formatDate
  };
  
  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
};

export default NutritionContext;
