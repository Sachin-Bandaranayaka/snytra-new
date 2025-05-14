import axios from 'axios';
import nextAxiosNetwork, { middlewares } from 'next-axios-network';

// Configure the default axios instance with Next-Axios-Network
nextAxiosNetwork(axios);

// If you have any custom axios instances, configure them here
export const createCustomAxios = (baseURL: string = '', headers = {}) => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });

    // Add Next-Axios-Network interceptors to monitor this instance too
    instance.interceptors.request.use(
        middlewares.requestMiddleWare,
        middlewares.requestError
    );

    instance.interceptors.response.use(
        middlewares.responseMiddleWare,
        middlewares.responseError
    );

    return instance;
};

// Export configured axios
export default axios; 