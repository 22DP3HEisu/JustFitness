import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";
import "./login.css"
import { useState, useContext } from "react";
import { UserContext } from "../../Contexts/UserContext";

function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useContext(UserContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsLoading(true); // Set loading state
        
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        if (!email || !password) {
            setError("Please enter both email and password");
            setIsLoading(false);
            return;
        }
        
        axios.post("/login", {
            "email": email,
            "password": password
        })
        .then((response) => {
            window.localStorage.setItem("token", response.data.token);
            
            // Fetch user data immediately after login
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
                setError(err.response.data.message || "Login failed. Please check your credentials.");
            } else if (err.request) {
                // The request was made but no response was received
                setError("No response from server. Please try again later.");
            } else {
                // Something happened in setting up the request
                setError(err.message || "An error occurred. Please try again.");
            }
        });
    }

    return (
        <div className="Login">
            <h2>Log In</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
                <button 
                    className="Button1" 
                    type="submit" 
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Log In"}
                </button>
            </form>
        </div>
    );
}

export default Login;