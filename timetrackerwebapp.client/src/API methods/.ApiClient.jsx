import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// if (!process.env.REACT_APP_API_BASE_URL)

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;