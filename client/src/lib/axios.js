import Axios from "axios";

const axios = Axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: true,
    withXSRFToken: true
})

axios.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    return config;
});

export default axios;