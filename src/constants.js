// API constants
export const API_URL =
  process.env.INDIGOTRACE_API_URL ||
  process.env.REACT_APP_INDIGOTRACE_API_URL ||
  'https://api.indigotrace.com';
export const API_VERSION =
  process.env.INDIGOTRACE_API_VERSION ||
  process.env.REACT_APP_INDIGOTRACE_API_VERSION ||
  'v1';

// ROUTE constants
export const ROUTE_SDK_TRACES = `/${API_VERSION}/sdk/traces`;
export const ROUTE_SDK_AUTH = `/${API_VERSION}/sdk/auth`;
