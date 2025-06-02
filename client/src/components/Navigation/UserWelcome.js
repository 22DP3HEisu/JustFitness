import React from 'react';
import PropTypes from 'prop-types';

const UserWelcome = ({ user }) => {
    return (
        <div className="user-welcome">
            <span className="material-symbols-outlined user-icon">account_circle</span>
            <span className="user-name">{user.name}</span>
        </div>
    );
};

UserWelcome.propTypes = {
    user: PropTypes.object.isRequired
};

export default UserWelcome;
