import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

const UserProfile = ({ user, closeSidebar }) => {
    return (
        <div className="sidebar-footer">
            <Link to="/profile" className="profile-link" onClick={closeSidebar}>
                <span className="material-symbols-outlined profile-icon">account_circle</span>
                <div className="profile-info">
                    <span className="profile-name">{user.name}</span>
                    <span className="profile-role">{user.role === 'admin' ? 'Administrator' : 'Member'}</span>
                </div>
            </Link>
        </div>
    );
};

const Sidebar = ({ isOpen, user, navItems, closeSidebar }) => {
    const location = useLocation();
    
    return (
        <>
            {/* Overlay when sidebar is open */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar navigation */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="material-symbols-outlined logo-icon">exercise</span>
                        <span className="sidebar-title">JustFitness</span>
                    </div>
                    <div className="close-sidebar" onClick={closeSidebar}>
                        <span className="material-symbols-outlined">close</span>
                    </div>
                </div>

                <div className="sidebar-content">
                    <nav className="sidebar-nav">
                        {navItems.map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.to} 
                                className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
                                onClick={closeSidebar}
                            >
                                <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {user && <UserProfile user={user} closeSidebar={closeSidebar} />}
                </div>
            </div>
        </>
    );
};

UserProfile.propTypes = {
    user: PropTypes.object.isRequired,
    closeSidebar: PropTypes.func.isRequired
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object,
    navItems: PropTypes.array.isRequired,
    closeSidebar: PropTypes.func.isRequired
};

export default Sidebar;
