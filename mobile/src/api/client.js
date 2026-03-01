import axios from 'axios';

const client = axios.create({ baseURL: 'https://backend-production-f128.up.railway.app' });

export default client;
