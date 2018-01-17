// API constants
export const API_URL =
  process.env.INDIGOTRACE_API_URL || 'http://localhost:1337';
export const API_VERSION = process.env.INDIGOTRACE_API_VERSION || 'v1';

// ROUTE constants
export const ROUTE_SDK_TRACES = `/workflow/${API_VERSION}/sdk/traces`;
