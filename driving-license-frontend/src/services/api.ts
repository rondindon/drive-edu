import axios from 'axios';

const API_URL = 'https://drive-edu.onrender.com/api';

export const registerUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/register`, { email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const fetchQuestions = async (group: string) => {
  const response = await axios.get(`${API_URL}/questions?group=${group}`);
  return response.data;
};
