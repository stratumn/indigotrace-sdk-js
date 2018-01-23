// API constants
export const API_URL =
  process.env.INDIGOTRACE_API_URL || 'https://staging-www.indigotrace.com';
export const API_VERSION = process.env.INDIGOTRACE_API_VERSION || 'v1';

// ROUTE constants
export const ROUTE_SDK_TRACES = `/workflow/${API_VERSION}/sdk/traces`;
export const ROUTE_SDK_AUTH = `/workflow/${API_VERSION}/sdk/auth`;
