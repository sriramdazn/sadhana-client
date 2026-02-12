export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8086";

// AUTH
export const REQUEST_OTP_PATH = "/v1/auth/register"; 
export const VERIFY_OTP_PATH  = "/v1/auth/verify-email";
export const GET_USER_PATH = "v1/user";
export const LOGOUT_USER_PATH = "v1/auth/logout"