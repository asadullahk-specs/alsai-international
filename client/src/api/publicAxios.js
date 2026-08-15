import axios from 'axios';
import { getCustomerAccessToken } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const publicAxios = axios.create({ baseURL: BASE_URL });

// A handful of routes mounted at the public `/api` prefix (reviews,
// testimonials) still require a logged-in customer - attaching the token
// here when one exists means those calls no longer need their own separate
// axios instance, and fixes the "authentication required" error that showed
// up when submitting a review/testimonial while logged in.
publicAxios.interceptors.request.use((config) => {
  const token = getCustomerAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default publicAxios;