import React, { useContext } from "react";
import { Link } from "react-router-dom";

export default function Header({ user }) {
    return (
      <header>
        <h1>JustFitness</h1>
        {user ? (
          <p>Welcome, {user.name}</p>
        ) : (
          <div>
            <Link className="Button1" to="/signup">Sign Up</Link>
            <Link className="Button1" to="/login">Log In</Link>
          </div>
        )}
      </header>
    );
}