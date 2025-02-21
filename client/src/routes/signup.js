import "../styles/signup.css"
import axios from "../lib/axios";
<<<<<<< HEAD
import { Router, Navigate } from "react-router-dom";
import { useState } from "react";

function SignUp() { 
    const [error, setError] = useState(null);
=======
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import { useContext } from "react";

function SignUp() { 
    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContext)
>>>>>>> 3d2139cbdd8b208ae72f76e4c1dfad24986158fd

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        axios.post("/register", {
            "username": username,
            "email": email,
            "password": password
        })
        .then((response) => {
            window.localStorage.setItem("token", response.data.token);
            setUser(response.data.user);

            navigate("/");
        })
        .catch((err) => {
            setError(err.message);
        });
    }

    return (
        <div class="SignUp">
            <h2>Sign Up</h2>
            {error && <p class="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label for="username">Username</label>
                <input type="text" id="username" name="username"></input>
                <label for="email">Email</label>
                <input type="email" id="email" name="email"></input>
                <label for="password">Password</label>
                <input type="password" id="password" name="password"></input>
                <button class="Button1" type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;