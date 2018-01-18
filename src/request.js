import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { API_URL } from './constants';

axios.defaults.adapter = httpAdapter;
axios.defaults.baseURL = API_URL;

const request = (method, route, body = null) => {
  const config = {
    url: route,
    method,
    data: body,
    headers: { 'Content-Type': 'application/json' }
  };

  return axios.request(config).then(({ data }) => data);
};

export const getRequest = route => request('get', route);
export const postRequest = (route, body) => request('post', route, body);
