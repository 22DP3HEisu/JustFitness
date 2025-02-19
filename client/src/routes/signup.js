import "../styles/signup.css"
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import { useContext } from "react";

function SignUp() { 
    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContext)

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
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div class="SignUp">
            <h2>Sign Up</h2>
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