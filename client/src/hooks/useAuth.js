import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    },
  });
}
