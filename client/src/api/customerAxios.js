import axios from 'axios';
import { getCustomerAccessToken, setCustomerAccessToken } from './tokenStore';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customer`;

const customerAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const readCookie = (name) => document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));

customerAxios.interceptors.request.use((config) => {
  const token = getCustomerAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrf = readCookie('csrf_customer_token');
    if (csrf) config.headers['X-CSRF-Token'] = csrf.split('=')[1];
  }

  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

customerAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return customerAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await customerAxios.post('/auth/refresh');
        const newToken = data.data.accessToken;
        setCustomerAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return customerAxios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setCustomerAccessToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default customerAxios;
