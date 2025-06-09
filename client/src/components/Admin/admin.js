import axios from "../../lib/axios.js";
import "./admin.css"
import { useEffect, useState } from "react";
import EditableCell from "./editableCell.js";

function Login() {
    const [Accounts, SetAccounts] = useState([]);
    const [filteredAccounts, SetFilteredAccounts] = useState([]);
    const [roleCounts, setRoleCounts] = useState({ user: 0, admin: 0, total: 0 });
    const [SortBy, SetSortBy] = useState("id");
    const [SortOrder, SetSortOrder] = useState("asc");
    const [EditAccount, SetEditAccount] = useState(null);
    const [Edits, SetEdits] = useState({});
    const [roleFilter, setRoleFilter] = useState("all");
      useEffect(() => {
        axios.get("/admin/users")
            .then(({ data }) => {
                // Check if data has users property (new API structure)
                if (data.users) {
                    SetAccounts(data.users);
                    SetFilteredAccounts(data.users);
                    setRoleCounts(data.roleCounts || { user: 0, admin: 0, total: 0 });
                } else {
                    // Fallback for old API structure
                    SetAccounts(data);
                    SetFilteredAccounts(data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch accounts:", err);
            });
    }, []);
    
    // Effect to reapply filters when Accounts or roleFilter changes
    useEffect(() => {
        // Skip on initial load when Accounts is empty
        if (Accounts.length === 0) return;
        
        const filtered = Accounts.filter(account => {
            // Apply role filter
            if (roleFilter !== "all" && account.role !== roleFilter) {
                return false;
            }
            
            // Get current search term if it exists
            const searchInput = document.querySelector('input[type="text"]');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            // Apply search term filter
            if (searchTerm) {
                return Object.values(account).some(value =>
                    String(value).toLowerCase().includes(searchTerm)
                );
            }
            
            return true;
        });
        
        SetFilteredAccounts(filtered);
    }, [Accounts, roleFilter]);

    const orderBy = (column) => {
        const newSortOrder = SortBy === column && SortOrder === "asc" ? "desc" : "asc";
        SetSortBy(column);
        SetSortOrder(newSortOrder);

        const sortedAccounts = [...Accounts].sort((a, b) => {
            if (newSortOrder === "asc") {
                return a[column] > b[column] ? 1 : -1;
            } else {
                return a[column] < b[column] ? 1 : -1;
            }
        });

        SetFilteredAccounts(sortedAccounts);
    };    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();

        const filtered = Accounts.filter(account => {
            // First check role filter
            if (roleFilter !== "all" && account.role !== roleFilter) {
                return false;
            }
            
            // Then check search term
            return Object.values(account).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
        });

        SetFilteredAccounts(filtered);
    }
    
    const handleRoleFilterChange = (event) => {
        const selectedRole = event.target.value;
        setRoleFilter(selectedRole);
        
        // Apply both filters
        const searchInput = document.querySelector('input[type="text"]');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filtered = Accounts.filter(account => {
            // Apply role filter
            if (selectedRole !== "all" && account.role !== selectedRole) {
                return false;
            }
            
            // Apply search term
            return Object.values(account).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
        });
        
        SetFilteredAccounts(filtered);
    }
    
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            axios.delete(`/admin/users/${id}`)
                .then((response) => {
                    const updatedAccounts = Accounts.filter(account => account.id !== id);
                    SetAccounts(updatedAccounts);
                    SetFilteredAccounts(filteredAccounts.filter(account => account.id !== id));
                    
                    // Update role counts from API response if available
                    if (response.data && response.data.roleCounts) {
                        setRoleCounts(response.data.roleCounts);
                    } else {
                        // Fallback to manual calculation
                        const deletedUser = Accounts.find(account => account.id === id);
                        if (deletedUser) {
                            const role = deletedUser.role;
                            setRoleCounts(prev => ({
                                ...prev,
                                [role]: Math.max(0, prev[role] - 1),
                                total: Math.max(0, prev.total - 1)
                            }));
                        }
                    }
                })
                .catch((err) => {
                    console.error("Failed to delete account:", err);
                });
        }
    }

    const handleChange = (field, value) => {
        SetEdits({
            ...Edits,
            [field]: value
        });
    };
      const handleEdit = (id) => {
        if (EditAccount === id) {
            console.log("Saving changes for account:", id);
            const updatedAccount = {
                ...Accounts.find(account => account.id === id),
                ...Edits
            };
            
            axios.put(`/admin/users/${id}`, updatedAccount)
                .then((response) => {
                    // Check if response includes user and roleCounts
                    if (response.data && response.data.roleCounts) {
                        setRoleCounts(response.data.roleCounts);
                    } else {
                        // Fallback to manual calculation
                        const originalAccount = Accounts.find(account => account.id === id);
                        const roleChanged = originalAccount && Edits.role && originalAccount.role !== Edits.role;
                        
                        if (roleChanged) {
                            setRoleCounts(prev => ({
                                ...prev,
                                [originalAccount.role]: Math.max(0, prev[originalAccount.role] - 1),
                                [Edits.role]: prev[Edits.role] + 1
                            }));
                        }
                    }
                    
                    SetAccounts(Accounts.map(account => (account.id === id ? updatedAccount : account)));
                    SetFilteredAccounts(filteredAccounts.map(account => (account.id === id ? updatedAccount : account)));
                    SetEditAccount(null);
                    SetEdits({});
                })
                .catch((err) => {
                    console.error("Failed to update account:", err);
                });
        } else if (EditAccount === null) {
            console.log("Editing account:", id);
            
            SetEditAccount(id);
        }
    }

    return (
        <div class="Admin">
            <h2>Admin Page</h2>            <div className="role-counts">
                <p>Total Users: {roleCounts.total} ({roleCounts.user} regular users, {roleCounts.admin} administrators)</p>
            </div>
            
            <div className="filter-container">
                <input type="text" placeholder="Search..." onChange={handleSearch} />
                
                <div className="role-filter">
                    <label htmlFor="role-filter">Filter by role: </label>
                    <select 
                        id="role-filter" 
                        value={roleFilter} 
                        onChange={handleRoleFilterChange}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        {["id", "name", "email", "role", "created_at", "updated_at"].map(column => (
                            <th key={column} onClick={() => orderBy(column)}>
                                {column.charAt(0).toUpperCase() + column.slice(1)}
                                {SortBy === column && (SortOrder === "desc" ? " ▲" : " ▼")}
                            </th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAccounts.map((account) => (
                        <tr key={account.id}>
                            <td>{account.id}</td>
                            <td>
                                <EditableCell
                                    Value={EditAccount === account.id && Edits.name !== undefined ? Edits.name : account.name}
                                    isEditing={EditAccount === account.id}
                                    onChange={(value) => handleChange("name", value)}
                                />
                            </td>
                            <td>
                                <EditableCell
                                    Value={EditAccount === account.id && Edits.email !== undefined ? Edits.email : account.email}
                                    isEditing={EditAccount === account.id}
                                    onChange={(value) => handleChange("email", value)}
                                />
                            </td>
                            <td>
                                <EditableCell
                                    Value={EditAccount === account.id && Edits.role !== undefined ? Edits.role : account.role}
                                    isEditing={EditAccount === account.id}
                                    Field="role"
                                    onChange={(value) => handleChange("role", value)}
                                />
                            </td>
                            <td>{new Date(account.created_at).toLocaleDateString()}</td>
                            <td>{new Date(account.updated_at).toLocaleDateString()}</td>
                            <td>
                                <button class="Button1" onClick={() => handleEdit(account.id)}> {EditAccount === account.id ? "Save" : "Edit"} </button>
                                <button class="Button1" onClick={() => handleDelete(account.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Login;