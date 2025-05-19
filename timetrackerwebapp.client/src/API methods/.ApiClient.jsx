import axios from 'axios';

// const API_BASE_URL = process.env.VITE_APP_API_BASE_URL ?? 'http://localhost:8080/api';
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}}/api`

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;