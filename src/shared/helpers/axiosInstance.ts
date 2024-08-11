import axios from "axios";

// const localhost_backend = process.env.NEXT_PUBLIC_API_GATEWAY_URL
// const localhost_backend = "http://13.71.119.101"; 
export const localhost_backend = "https://6da4kw17v5.execute-api.ap-south-1.amazonaws.com";

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