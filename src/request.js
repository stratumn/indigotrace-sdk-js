import https from 'https';
import fs from 'fs';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { KEY_PATH, CRT_PATH } from './constants';

axios.defaults.adapter = httpAdapter;

const httpsAgent = new https.Agent({
  port: 443,
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CRT_PATH),
  rejectUnauthorized: false
});

const request = (method, route, options) => {
  const config = {
    url: route,
    method,
    headers: { 'Content-Type': 'application/json' },
    httpsAgent: httpsAgent
  };

  if (options) {
    if (options.data) config.data = options.data;
    if (options.baseURL) config.baseURL = options.baseURL;
  }

  return axios.request(config).then(({ data }) => data);
};

export default request;
