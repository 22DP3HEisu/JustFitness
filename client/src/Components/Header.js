import "../styles/header.css";

import React from "react";
import { Link } from "react-router-dom";

export default function Header({ user }) {
    return (
      <header>
        <h1>
          <Link to="/" className="header-link">JustFitness</Link>
        </h1>
        {user ? (
          <div className="user-info">
            <p>Welcome, {user.name}</p>
            <Link className="Button1" to="/profile">Profile</Link>
            {user.role === "admin" && (
              <Link className="Button1" to="/admin">Admin Page</Link>
            )}
          </div>
        ) : (
          <div>
            <Link className="Button1" to="/signup">Sign Up</Link>
            <Link className="Button1" to="/login">Log In</Link>
          </div>
        )}
      </header>
    );
}