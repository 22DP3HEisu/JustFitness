import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
<<<<<<< HEAD
import "../styles/login.css"
import { useState } from "react";

function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
=======
import "../styles/login.css";
import UserContext from "../contexts/UserContext";
import { useContext } from "react";

function Login() {
    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContext)
>>>>>>> 3d2139cbdd8b208ae72f76e4c1dfad24986158fd

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        axios.post("/login", {
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
        <div class="Login">
            <h2>Log In</h2>
            {error && <p class="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label for="email">Email</label>
                <input type="email" id="email" name="email"></input>
                <label for="password">Password</label>
                <input type="password" id="password" name="password"></input>
                <button class="Button1" type="submit">Log In</button>
            </form>
        </div>
    );
}

export default Login;