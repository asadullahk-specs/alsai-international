import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const publicAxios = axios.create({ baseURL: BASE_URL });

export default publicAxios;
