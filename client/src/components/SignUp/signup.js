import "./signup.css";
import axios from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { UserContext } from "../../Contexts/UserContext";

function SignUp() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [unitPreference, setUnitPreference] = useState("metric"); // Default to metric
    const { setUser } = useContext(UserContext);    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsLoading(true); // Set loading state
        
        try {
            const username = e.target.username.value.trim();
            const email = e.target.email.value.trim();            const password = e.target.password.value;
            const weight = parseInt(e.target.weight.value, 10);
            const height = parseInt(e.target.height.value, 10);
            const dateOfBirth = e.target.dateOfBirth.value;
            const goalWeight = parseInt(e.target.goal_weight.value, 10);
            const activityLevel = e.target.activity_level.value;
            
            // Basic validation
            if (!username || username.length < 3) {
                setError("Username must be at least 3 characters long");
                setIsLoading(false);
                return;
            }
            
            if (!email || !email.includes('@') || !email.includes('.')) {
                setError("Please enter a valid email address");
                setIsLoading(false);
                return;
            }
            
            if (!password || password.length < 6) {
                setError("Password must be at least 6 characters long");
                setIsLoading(false);
                return;
            }
            
            if (isNaN(weight) || weight <= 0) {
                setError("Please enter a valid weight");
                setIsLoading(false);
                return;
            }
              if (isNaN(height) || height <= 0) {
                setError("Please enter a valid height");
                setIsLoading(false);
                return;
            }
            
            if (!dateOfBirth) {
                setError("Please enter your date of birth");
                setIsLoading(false);
                return;
            }
            
            if (isNaN(goalWeight) || goalWeight <= 0) {
                setError("Please enter a valid goal weight");
                setIsLoading(false);
                return;
            }            axios.post("/register", {
                username,
                email,
                password,
                weight,
                height,
                dateOfBirth,
                goalWeight,
                activityLevel,
                unitPreference,
            })
            .then((response) => {
                window.localStorage.setItem("token", response.data.token);
                
                // Fetch user data immediately after registration
                return axios.get("/user");
            })
            .then((userResponse) => {
                // Update user context with the fetched data
                setUser(userResponse.data);
                setIsLoading(false);
                navigate("/");
            })
            .catch((err) => {
                setIsLoading(false);
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    setError(err.response.data.message || "Registration failed. Please try different credentials.");
                } else if (err.request) {
                    // The request was made but no response was received
                    setError("No response from server. Please try again later.");
                } else {
                    // Something happened in setting up the request
                    setError(err.message || "An error occurred. Please try again.");
                }
            });
        } catch (error) {
            setIsLoading(false);
            setError("An unexpected error occurred. Please try again.");
            console.error("Form submission error:", error);
        }
    };

    const toggleUnitPreference = () => {
        setUnitPreference((prev) => (prev === "metric" ? "imperial" : "metric"));
    };

    return (
        <div className="SignUp">
            <h2>Sign Up</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required />

                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />

                <label htmlFor="weight">
                    Weight ({unitPreference === "metric" ? "kg" : "lbs"})
                </label>
                <input
                    type="number"
                    id="weight"
                    name="weight"
                    min={0}
                    max={unitPreference === "metric" ? 150 : 330}
                    placeholder={unitPreference === "metric" ? "e.g., 70" : "e.g., 154"}
                    required
                />

                <label htmlFor="height">
                    Height ({unitPreference === "metric" ? "cm" : "inches"})
                </label>
                <input
                    type="number"
                    id="height"
                    name="height"
                    min={0}
                    max={unitPreference === "metric" ? 250 : 100}
                    placeholder={unitPreference === "metric" ? "e.g., 175" : "e.g., 69"}                    required
                />

                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input 
                    type="date" 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    required 
                    max={new Date().toISOString().split('T')[0]} // Prevents future dates
                />

                <label htmlFor="goal_weight">
                    Goal Weight ({unitPreference === "metric" ? "kg" : "lbs"})
                </label>
                <input
                    type="number"
                    id="goal_weight"
                    name="goal_weight"
                    min={0}
                    max={unitPreference === "metric" ? 150 : 330}
                    placeholder={unitPreference === "metric" ? "e.g., 65" : "e.g., 143"}
                    required
                />

                <label htmlFor="activity_level">Activity Level</label>
                <select id="activity_level" name="activity_level" required>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                </select>                <div className="slider-container">
                    <span>Unit Preference</span>
                    <div className="slider-wrapper">
                        <span>Metric</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="unit_preference"
                                name="unit_preference"
                                checked={unitPreference === "imperial"}
                                onChange={toggleUnitPreference}
                            />
                            <span className="slider"></span>
                        </label>
                        <span>Imperial</span>
                    </div>
                </div>

                <button 
                    className="Button1" 
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}

export default SignUp;