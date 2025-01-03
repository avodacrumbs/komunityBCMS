import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = '/api'; 

const APIservice = {
    // Fetch all users with optional pagination
    getUsers: async (offset = 0, limit = 8) => {
        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}/users.php`;
            const response = await axios.get(apiUrl, { params: { offset, limit } });
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get a user by ID
    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Create a new user
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users`, userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update an existing user
    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete a user
    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

export default APIservice;
