import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

axios.defaults.adapter = httpAdapter;

const request = (method, route, options) => {
  const config = {
    url: route,
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (options) {
    if (options.data) config.data = options.data;
    if (options.baseURL) config.baseURL = options.baseURL;
    if (options.httpsAgent) config.httpsAgent = options.httpsAgent;
  }

  return axios.request(config).then(({ data }) => data);
};

export default request;
