import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import UserWelcome from './UserWelcome';

const TopNavbar = ({ user, toggleSidebar }) => {
    return (
        <div className="top-nav">
            <div className="hamburger-menu" onClick={toggleSidebar}>
                <span className="material-symbols-outlined">menu</span>
            </div>
            <h1 className="app-title">
                <Link to="/" className="app-title-link">JustFitness</Link>
            </h1>
            {user && <UserWelcome user={user} />}
        </div>
    );
};

TopNavbar.propTypes = {
    user: PropTypes.object,
    toggleSidebar: PropTypes.func.isRequired
};

export default TopNavbar;
