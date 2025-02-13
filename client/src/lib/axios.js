import Axios from "axios";

const axios = Axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: true,
    withXSRFToken: true
})

axios.interceptors.request.use((config) => {
    const tokenElement = document.head.querySelector('meta[name="csrf-token"]');
    if (tokenElement) {
        const csrfToken = tokenElement.getAttribute('content');
        config.headers['X-XSRF-TOKEN'] = csrfToken;
        
        console.log("CSRF Token:", csrfToken);
    } else {
        console.warn("CSRF token not found in meta tags.");
    }
    return config;
});

export default axios;