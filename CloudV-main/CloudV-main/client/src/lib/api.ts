import axios from 'axios';

const API_END_POINT = import.meta.env.VITE_API_END_POINT;

export const api = axios.create({
  baseURL: API_END_POINT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type ApiErrorResponse = {
  message?: string;
};


export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}