import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { API_URL } from './constants';

axios.defaults.adapter = httpAdapter;
axios.defaults.baseURL = API_URL;

const request = (method, route, options) => {
  const config = {
    url: route,
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (options) {
    if (options.data) config.data = options.data;
    if (options.auth) config.headers.Authorization = options.auth;
  }

  return axios.request(config).then(({ data }) => data);
};

export default request;
