import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SignupData {
  id: number;
  name: string;
  email: string;
  gender: string;
  contactNumber: string;
  iAm: string;
  collegeRollNumber?: string;
  dateOfBirth: string;
}

interface OtpState {
  hasSentOtps: boolean;
  lastOtpSentTime: number | null;
  emailTimer: number;
  phoneTimer: number;
  otpSentCount: number;
}

interface SignupState {
  signupData: SignupData | null;
  isLoading: boolean;
  otpState: OtpState;
  setSignupData: (data: SignupData) => void;
  clearSignupData: () => void;
  setLoading: (loading: boolean) => void;
  // OTP state management
  setOtpSent: (emailTime: number, phoneTime: number) => void;
  updateOtpTimers: (emailTimer: number, phoneTimer: number) => void;
  resetOtpState: () => void;
  canSendOtp: () => boolean;
}

export const useSignupStore = create<SignupState>()(
  persist(
    (set, get) => ({
      signupData: null,
      isLoading: false,
      otpState: {
        hasSentOtps: false,
        lastOtpSentTime: null,
        emailTimer: 0,
        phoneTimer: 0,
        otpSentCount: 0,
      },
      setSignupData: (data: SignupData) => {
        set({ signupData: data });
      },
      clearSignupData: () => {
        set({
          signupData: null,
          otpState: {
            hasSentOtps: false,
            lastOtpSentTime: null,
            emailTimer: 0,
            phoneTimer: 0,
            otpSentCount: 0,
          },
        });
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // OTP state management
      setOtpSent: (emailTimer: number, phoneTimer: number) => {
        const now = Date.now();
        set((state) => ({
          otpState: {
            ...state.otpState,
            hasSentOtps: true,
            lastOtpSentTime: now,
            emailTimer,
            phoneTimer,
            otpSentCount: state.otpState.otpSentCount + 1,
          },
        }));
      },

      updateOtpTimers: (emailTimer: number, phoneTimer: number) => {
        set((state) => ({
          otpState: {
            ...state.otpState,
            emailTimer,
            phoneTimer,
          },
        }));
      },

      resetOtpState: () => {
        set((state) => ({
          otpState: {
            ...state.otpState,
            hasSentOtps: false,
            lastOtpSentTime: null,
            emailTimer: 0,
            phoneTimer: 0,
            otpSentCount: 0,
          },
        }));
      },

      canSendOtp: () => {
        const state = get();
        const now = Date.now();
        const cooldownPeriod = 30000; // 30 second cooldown
        const maxOtpCount = 5; // Max 5 OTP attempts per session

        if (state.otpState.otpSentCount >= maxOtpCount) {
          return false;
        }

        if (
          state.otpState.lastOtpSentTime &&
          now - state.otpState.lastOtpSentTime < cooldownPeriod
        ) {
          return false;
        }

        return true;
      },
    }),
    {
      name: "signup-storage",
    }
  )
);
