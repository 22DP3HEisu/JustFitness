import PropTypes from 'prop-types';

// Navigation items data and filtering logic
const useNavItems = (user) => {    // Define navigation items with icons
    const navItems = [
        { to: '/', label: 'Home', icon: 'home', showWhen: 'always' },        { to: '/workouts', label: 'Workouts', icon: 'fitness_center', showWhen: 'authenticated' },
        { to: '/create-workout', label: 'Create Workout', icon: 'add_circle', showWhen: 'authenticated' },
        { to: '/create-exercise', label: 'Create Exercise', icon: 'sports_gymnastics', showWhen: 'authenticated' },
        { to: '/muscle-groups', label: 'Muscle Groups', icon: 'self_improvement', showWhen: 'authenticated' },
        { to: '/profile', label: 'Profile', icon: 'person', showWhen: 'authenticated' },
        { to: '/admin', label: 'Admin', icon: 'admin_panel_settings', showWhen: 'admin' },
        { to: '/login', label: 'Login', icon: 'login', showWhen: 'unauthenticated' },
        { to: '/signup', label: 'Sign Up', icon: 'person_add', showWhen: 'unauthenticated' },
    ];

    // Filter navigation items based on user's authentication status
    const filteredNavItems = navItems.filter(item => {
        if (item.showWhen === 'always') return true;
        if (item.showWhen === 'authenticated' && user) return true;
        if (item.showWhen === 'unauthenticated' && !user) return true;
        if (item.showWhen === 'admin' && user && user.role === 'admin') return true;
        return false;
    });

    return filteredNavItems;
};

useNavItems.propTypes = {
    user: PropTypes.object
};

export default useNavItems;
