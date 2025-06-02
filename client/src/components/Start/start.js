import "./start.css";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts/UserContext";

function Start() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            navigate("/workouts");
        } else {
            navigate("/signup");
        }
    };
    return (
        <div id="imgWrapper">
            <img id="backgroundImg" src="/images/gym3.jpg" alt="Gym interior"></img>
            <div id="backgroundGradient"></div>
            <h1>The best service for your fitness journey</h1>
            <button className="Button1 start-cta" onClick={handleGetStarted}>
                {user ? "View Workouts" : "Get Started"}
            </button>
        </div>
    );
}

export default Start;