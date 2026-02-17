export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://server-04mx.onrender.com";

// AUTH
export const REQUEST_OTP_PATH = "/v1/auth/register"; 
export const VERIFY_OTP_PATH  = "/v1/auth/verify-email";
export const GET_USER_PATH = "v1/user";
export const LOGOUT_USER_PATH = "v1/auth/logout";
export const RESET_USER_PATH = "v1/user/reset-journey";