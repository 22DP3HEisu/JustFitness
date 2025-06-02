import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Navigation.css';

// Import components
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import MiniSidebar from './MiniSidebar';
import useNavItems from './useNavItems';

const Navigation = ({ user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const filteredNavItems = useNavItems(user);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <>
            <TopNavbar 
                user={user} 
                toggleSidebar={toggleSidebar} 
            />
            
            <Sidebar 
                isOpen={isSidebarOpen} 
                user={user} 
                navItems={filteredNavItems} 
                closeSidebar={closeSidebar} 
            />
            
            <MiniSidebar 
                navItems={filteredNavItems} 
            />
        </>
    );
};

Navigation.propTypes = {
    user: PropTypes.object
};

export default Navigation;
