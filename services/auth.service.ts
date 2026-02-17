import { GET_USER_PATH, LOGOUT_USER_PATH, REQUEST_OTP_PATH, VERIFY_OTP_PATH } from "@/constants/api.constant";
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
  id: string;
  decayPoints: number;
  email: string,
  role: string,
  isEmailVerified: boolean,
  sadhanaPoints: number,
};

export type LogoutUserResponse = {
  message: string
};

export async function requestEmailOtp(email: string) {
  return http.post<RequestOtpResponse>(REQUEST_OTP_PATH, { email });
}

export async function verifyEmailOtp(payload: { otpId: string; otp: number, sadanas: []}) {
  return http.post<VerifyOtpResponse>(VERIFY_OTP_PATH, payload);
}

export async function getUserId(token: string) {
  return http.get<GetUserResponse>(GET_USER_PATH, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function requestLogout(token: string) {
  return http.post<LogoutUserResponse>(
    LOGOUT_USER_PATH,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function setDecayPoints(
  payload: { decayPoints: number },
  token: string
) {
  return http.patch<GetUserResponse>(
    GET_USER_PATH,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}