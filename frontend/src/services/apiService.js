import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const apiService = {
    getCompanies: async () => {
        try {
            console.log('Fetching companies...');  // Debug log
            const response = await api.get('/companies');
            console.log('Companies fetched:', response.data);  // Debug log
            return response.data;
        } catch (error) {
            console.error('Error fetching companies:', error.response || error);
            return [];
        }
    },

    getStockData: async (company) => {
        try {
            console.log('Fetching stock data for:', company);  // Debug log
            const response = await api.get(`/stock-data/${encodeURIComponent(company)}`);
            console.log('Stock data fetched:', response.data.length, 'records');  // Debug log
            return response.data;
        } catch (error) {
            console.error('Error fetching stock data:', error.response || error);
            return [];
        }
    },

    getPrediction: async (company) => {
        try {
            console.log('Fetching prediction for:', company);  // Debug log
            const response = await api.post(`/predict/${encodeURIComponent(company)}`);
            console.log('Prediction fetched:', response.data);  // Debug log
            return response.data;
        } catch (error) {
            console.error('Error getting prediction:', error.response || error);
            return null;
        }
    }
}; 