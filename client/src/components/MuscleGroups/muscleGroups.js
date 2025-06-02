import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import './muscleGroups.css';

const MuscleGroups = () => {
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMuscleGroups();
    }, []);

    const fetchMuscleGroups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/muscle-groups');
            setMuscleGroups(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching muscle groups:', error);
            toast.error('Failed to fetch muscle groups');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="muscle-groups-container">
                <h1 className="muscle-groups-title">Muscle Groups</h1>
                <div className="loading-message">Loading muscle categories...</div>
            </div>
        );
    }

    return (
        <div className="muscle-groups-container">
            <h1 className="muscle-groups-title">Muscle Groups</h1>
            
            <div className="muscle-groups-list">
                <h2 className="muscle-groups-subtitle">Available Muscle Groups</h2>
                {muscleGroups.length === 0 ? (
                    <p>No muscle groups found.</p>
                ) : (
                    <table className="muscle-groups-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {muscleGroups.map((muscleGroup) => (
                                <tr key={muscleGroup.id}>
                                    <td>{muscleGroup.name}</td>
                                    <td>{muscleGroup.description || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="info-message">
                    <p>These muscle groups are predefined in the system to help categorize exercises. You can use them to target specific muscle areas in your workouts.</p>
                </div>
            </div>
        </div>
    );
};

export default MuscleGroups;
