import axios from "axios";

const localhost_backend = "http://localhost:5000/";

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