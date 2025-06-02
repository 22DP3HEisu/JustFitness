import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

const MiniSidebar = ({ navItems }) => {
    const location = useLocation();
    
    return (
        <div className="mini-sidebar">
            <div className="sidebar-logo mini">
                <span className="material-symbols-outlined logo-icon">exercise</span>
            </div>
            <nav className="mini-nav">
                {navItems.map((item, index) => (
                    <Link 
                        key={index} 
                        to={item.to} 
                        className={`nav-item mini ${location.pathname === item.to ? 'active' : ''}`}
                        title={item.label}
                    >
                        <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

MiniSidebar.propTypes = {
    navItems: PropTypes.array.isRequired
};

export default MiniSidebar;
