import { GET_USER_PATH, REQUEST_OTP_PATH, VERIFY_OTP_PATH } from "@/constants/api.constant";
import { http } from "./http";

export type RequestOtpResponse = {
  otpId: string;
  message: string;
};

export type VerifyOtpResponse = {
  token: string;
  expires: string;
};

export type GetUserResponse = {
  userId: string;
};

export async function requestEmailOtp(email: string) {
  return http.post<RequestOtpResponse>(REQUEST_OTP_PATH, { email });
}

export async function verifyEmailOtp(payload: { otpId: string; otp: number }) {
  return http.post<VerifyOtpResponse>(VERIFY_OTP_PATH, payload);
}

export async function getUserId(token: string) {
  return http.get<GetUserResponse>(GET_USER_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
