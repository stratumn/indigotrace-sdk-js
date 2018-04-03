import { AlgorithmIdentifierEncoder } from './utils';

// API constants
export const API_URL =
  process.env.INDIGOTRACE_API_URL ||
  process.env.REACT_APP_INDIGOTRACE_API_URL ||
  'https://api.indigotrace.com';

export const API_VERSION =
  process.env.INDIGOTRACE_API_VERSION ||
  process.env.REACT_APP_INDIGOTRACE_API_VERSION ||
  'v1';

// Auth constants
export const { KEY_PATH, CRT_PATH } = process.env;

// ROUTE constants
export const ROUTE_SDK_TRACES = `/${API_VERSION}/sdk/traces`;
export const ROUTE_SDK_AUTH = `/${API_VERSION}/sdk/auth`;

// Signature algorithm constants
const aiBytes = AlgorithmIdentifierEncoder.encode(
  {
    algorithm: [1, 2, 840, 113549, 1, 1, 11]
  },
  'der'
);

export const RSA_WITH_SHA256 = aiBytes.toString('base64');
