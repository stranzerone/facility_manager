import axios from 'axios';
import { API_URL2 } from '@env';

// Define the base URL of your API
const API_BASE_URL = 'https://api.isocietymanager.com/logmein?token=ijFCLdBu8KV4G1I%2BlFjUAWjB1o0vIOBU7spHwUvb%2BvTbR3tDp3p%2FZ50NlFaBE1MjrjUJq3jQyhtgwp0R3AFFTF9Wxy3yK3OoSNDk5UCWU2hT0xvpLXDapeGgPmF2wch8turMTCYyZLhBxx0dzR%2Br4pvujhenMYAQuF6E6N%2BKdKKlfGHqUM6dY3BPCda8QNHs3p%2FZtIGW6bYIllhis%2F%2B2yosiONB0T3LWGoRXUQ423YZ7Hh9YGAUo7keLCc0SHkrC7A4J3z3MYMj4XrzKgt9ERAFSzE3rF31elYNsJr5f1%2FKwCXJgHw3i5dNPLUZ4Q2AgYQle%2Bv4rCU136wv44VmqZ637uSJ%2B0gpzpnwsDCyBwR5crXxZdz2SDKqQJwyo8141'; // Adjusting endpoint as needed

// Function to check if a user exists based on API token
const MultipleUserLogin = async (user) => {

    try {
        const response = await axios.post(API_BASE_URL, user); // Use POST request with payload


        // Assuming the API returns a JSON object with an 'exists' property
        return response.data; // Adjust according to your API response structure
    } catch (error) {
        console.error('Error fetching user existence:', error);
        throw error; // Rethrow or handle error as needed
    }
};

export default MultipleUserLogin;
