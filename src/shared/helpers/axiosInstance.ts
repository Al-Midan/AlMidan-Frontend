import axios from "axios";

const localhost_backend = process.env.NEXT_PUBLIC_API_GATEWAY_URL

const axiosInstance = axios.create({
  baseURL: localhost_backend,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const axiosInstanceMultipart = axios.create({
  baseURL: localhost_backend,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
});

export default axiosInstance;