import axios from 'axios';

const API_URL = '/api/users';

// register user
const register = async (userData) => {
    const response = await axios.post(API_URL, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// log in user
const login = async (userData) => {
    const response = await axios.post(API_URL + '/login', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// log out user
const logout = () => localStorage.removeItem('user');

// get all staff
const getAllStaff = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(API_URL + '/staff', config);

    return response.data.data;
};

const authService = {
    register,
    logout,
    login,
    getAllStaff,
};

export default authService;
