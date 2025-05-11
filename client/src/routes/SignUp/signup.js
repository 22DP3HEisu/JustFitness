import "./signup.css";
import axios from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SignUp() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [unitPreference, setUnitPreference] = useState("metric"); // Default to metric

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const weight = parseInt(e.target.weight.value, 10);
        const height = parseInt(e.target.height.value, 10);
        const age = parseInt(e.target.age.value, 10);
        const goalWeight = parseInt(e.target.goal_weight.value, 10);
        const activityLevel = e.target.activity_level.value;

        console.log(typeof(weight));

        axios.post("/register", {
            username,
            email,
            password,
            weight,
            height,
            age,
            goalWeight,
            activityLevel,
            unitPreference,
        })
        .then((response) => {
            window.localStorage.setItem("token", response.data.token);
            navigate("/");
        })
        .catch((err) => {
            setError(err.message);
        });
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
                    placeholder={unitPreference === "metric" ? "e.g., 175" : "e.g., 69"}
                    required
                />

                <label htmlFor="age">Age</label>
                <input type="number" id="age" name="age" min={0} max={150} required />

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
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                </select>

                <div className="slider-container">
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

                <button className="Button1" type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;