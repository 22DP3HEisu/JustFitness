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

axios.interceptors.response.use(null, (err) => {
    let error = {
        status: err.response?.status,
        original: err,
        message: null,
    }

    switch (err.response?.status) {
        case 401:
            window.localStorage.removeItem("token");
            window.location.href = "/login";
            break;
        case 403:
            error.message = "You do not have permission to access this page.";
            break;
        case 422:
            if (err.response.data.errors) {
                for (let field in err.response.data.errors) {
                    error.message = err.response.data.errors[field][0];
                    break;
                }
            } else {
                error.message = err.response.data.message;
            }
            break;
        default:
            error.message = "An error occurred.";
    }         
    return Promise.reject(error);
});

export default axios;