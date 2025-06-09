import "./profile.css";
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { UserContext } from '../../Contexts/UserContext';

export default function Profile({ user, onLogout }) {  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    weight: '',
    height: '',
    age: '',
    goal_weight: '',
    activity_level: '',
    unit_preference: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize form data when user data becomes available
  useEffect(() => {
    if (user && user.preferences) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        weight: user.preferences.weight || '',
        height: user.preferences.height || '',
        age: user.preferences.age ? user.preferences.age.split('T')[0] : '',
        goal_weight: user.preferences.goal_weight || '',
        activity_level: user.preferences.activity_level || '',
        unit_preference: user.preferences.unit_preference || 'metric'
      });
    }
  }, [user]);

  const handleLogout = () => {
    onLogout(); // Call the logout function passed as a prop
    navigate('/login'); // Redirect to the login page
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsChangingPassword(false);
    setError(null);
    setSuccess(null);
    
    // Reset form data to current user data when canceling edit
    if (isEditing && user && user.preferences) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        weight: user.preferences.weight || '',
        height: user.preferences.height || '',
        age: user.preferences.age ? user.preferences.age.split('T')[0] : '',
        goal_weight: user.preferences.goal_weight || '',
        activity_level: user.preferences.activity_level || '',
        unit_preference: user.preferences.unit_preference || 'metric'
      });
    }
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    
    // Reset password form
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.name || formData.name.length < 3) {
        setError("Username must be at least 3 characters long");
        setIsLoading(false);
        return;
      }
      
      if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) {
        setError("Please enter a valid weight");
        setIsLoading(false);
        return;
      }

      if (isNaN(parseFloat(formData.height)) || parseFloat(formData.height) <= 0) {
        setError("Please enter a valid height");
        setIsLoading(false);
        return;
      }

      if (isNaN(parseFloat(formData.goal_weight)) || parseFloat(formData.goal_weight) <= 0) {
        setError("Please enter a valid goal weight");
        setIsLoading(false);
        return;
      }

      // Send update request to the API
      const response = await axios.put('/user/profile', {
        name: formData.name,
        email: formData.email,
        preferences: {
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          goal_weight: formData.goal_weight,
          activity_level: formData.activity_level,
          unit_preference: formData.unit_preference
        }
      });

      // Update user context with the updated data
      setUser(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Update failed. Please try again.");
      } else if (err.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }      console.error("Profile update error:", err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!passwordData.current_password) {
        setError("Please enter your current password");
        setIsLoading(false);
        return;
      }
      
      if (!passwordData.new_password || passwordData.new_password.length < 6) {
        setError("New password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        setError("New passwords do not match");
        setIsLoading(false);
        return;
      }

      // Send password update request to the API
      await axios.put('/user/password', passwordData);

      // Show success message
      setSuccess("Password updated successfully!");
      setIsChangingPassword(false);
      setIsLoading(false);
      
      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        setError(err.response.data.message || "Password update failed. Please try again.");
      } else if (err.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
      console.error("Password update error:", err);
    }
  };

  const activityLevels = [
    'sedentary',
    'lightly active',
    'moderately active',
    'very active',
    'extremely active'
  ];

  const unitPreferences = ['metric', 'imperial'];

  // Show loading message if user data is not available yet
  if (!user) {
    return <div className="profile-container"><p>Loading profile data...</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
          {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">Weight ({formData.unit_preference === 'metric' ? 'kg' : 'lbs'})</label>
              <input 
                type="number" 
                id="weight" 
                name="weight" 
                value={formData.weight} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="height">Height ({formData.unit_preference === 'metric' ? 'cm' : 'inches'})</label>
              <input 
                type="number" 
                id="height" 
                name="height" 
                value={formData.height} 
                onChange={handleInputChange} 
                required 
              />
            </div>
              <div className="form-group">
              <label htmlFor="age">Date of Birth</label>
              <input 
                type="date" 
                id="age" 
                name="age" 
                value={formData.age} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="goal_weight">Goal Weight ({formData.unit_preference === 'metric' ? 'kg' : 'lbs'})</label>
              <input 
                type="number" 
                id="goal_weight" 
                name="goal_weight" 
                value={formData.goal_weight} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="activity_level">Activity Level</label>
              <select 
                id="activity_level" 
                name="activity_level" 
                value={formData.activity_level} 
                onChange={handleInputChange} 
                required
              >
                {activityLevels.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="unit_preference">Unit Preference</label>
              <select 
                id="unit_preference" 
                name="unit_preference" 
                value={formData.unit_preference} 
                onChange={handleInputChange} 
                required
              >
                {unitPreferences.map(unit => (
                  <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="button-group">
              <button type="submit" className="save-button" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="cancel-button" onClick={handleEditToggle}>
                Cancel
              </button>
            </div>
          </form>
        ) : isChangingPassword ? (
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="password-section">
              <h2>Change Password</h2>
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <input 
                  type="password" 
                  id="current_password" 
                  name="current_password" 
                  value={passwordData.current_password} 
                  onChange={handlePasswordInputChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input 
                  type="password" 
                  id="new_password" 
                  name="new_password" 
                  value={passwordData.new_password} 
                  onChange={handlePasswordInputChange} 
                  required 
                  minLength={6}
                />
                <small className="password-hint">Password must be at least 6 characters long</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirm_password" 
                  name="confirm_password" 
                  value={passwordData.confirm_password} 
                  onChange={handlePasswordInputChange} 
                  required 
                />
              </div>
              
              <div className="button-group">
                <button type="submit" className="save-button" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" className="cancel-button" onClick={handlePasswordToggle}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-info">
              <p><span>Username:</span> {user.name}</p>
              <p><span>Email:</span> {user.email}</p>              <p><span>Weight:</span> {user.preferences?.weight} {user.preferences?.unit_preference === 'metric' ? 'kg' : 'lbs'}</p>
              <p><span>Height:</span> {user.preferences?.height} {user.preferences?.unit_preference === 'metric' ? 'cm' : 'inches'}</p>
              <p><span>Date of Birth:</span> {user.preferences?.age ? new Date(user.preferences.age).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</p>
              <p><span>Goal Weight:</span> {user.preferences?.goal_weight} {user.preferences?.unit_preference === 'metric' ? 'kg' : 'lbs'}</p>
              <p><span>Activity Level:</span> {user.preferences?.activity_level}</p>
              <p><span>Unit Preference:</span> {user.preferences?.unit_preference}</p>
            </div>
            
            <div className="button-group">              <button className="edit-button" onClick={handleEditToggle}>
                Edit Profile
              </button>
              <button className="password-button" onClick={handlePasswordToggle}>
                Change Password
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}