import { usePermission, PERMISSIONS } from '../../utils/permissions';

// Navigation items data and filtering logic
const useNavItems = () => {
    const { hasPermission } = usePermission();
    
    // Define navigation items with icons and required permission
    const navItems = [
        { to: '/', label: 'Home', icon: 'home', permission: PERMISSIONS.PUBLIC },
        { to: '/workouts', label: 'Workouts', icon: 'fitness_center', permission: PERMISSIONS.AUTHENTICATED },
        { to: '/create-workout', label: 'Create Workout', icon: 'add_circle', permission: PERMISSIONS.AUTHENTICATED },
        { to: '/create-exercise', label: 'Create Exercise', icon: 'sports_gymnastics', permission: PERMISSIONS.AUTHENTICATED },
        { to: '/muscle-groups', label: 'Muscle Groups', icon: 'self_improvement', permission: PERMISSIONS.PUBLIC },
        { to: '/nutrition', label: 'Nutrition', icon: 'restaurant', permission: PERMISSIONS.AUTHENTICATED },
        { to: '/profile', label: 'Profile', icon: 'person', permission: PERMISSIONS.AUTHENTICATED },
        { to: '/admin', label: 'Admin', icon: 'admin_panel_settings', permission: PERMISSIONS.ADMIN },
        { to: '/login', label: 'Login', icon: 'login', permission: PERMISSIONS.PUBLIC, hideWhenAuth: true },
        { to: '/signup', label: 'Sign Up', icon: 'person_add', permission: PERMISSIONS.PUBLIC, hideWhenAuth: true },
    ];

    // Filter navigation items based on permissions
    const filteredNavItems = navItems.filter(item => {
        // Check if the user has permission for this item
        const hasRequiredPermission = hasPermission(item.permission);
        
        // Special case: hide login/signup when authenticated
        if (item.hideWhenAuth && hasPermission(PERMISSIONS.AUTHENTICATED)) {
            return false;
        }
        
        return hasRequiredPermission;
    });

    return filteredNavItems;
};

export default useNavItems;
