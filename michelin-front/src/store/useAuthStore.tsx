import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { IAuthState } from "../types/IAuthState";
import { getCookie, setCookie, removeCookie } from "../utils/cookies";
import api from "../service/api";

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      loggedIn: false,
      memberGrade: null,
      activeModal: "NONE",
      // 초기값을 쿠키에서 읽어옴 (새로고침 후에도 토큰 유지)
      accessToken: getCookie("accessToken") || null,
      toastMessage: null,
      introUnlocked: false,

      login: (grade: string, token: string) => {
        // 액세스 토큰을 쿠키에 저장 (1일)
        setCookie("accessToken", token, 1)
        set({ loggedIn: true, memberGrade: grade, accessToken: token });
      },

      logout: async () => {
        try {
          // ※ 백엔드 엔드포인트 확인 필요: /v1/auth/logout
          await api.post("/v1/auth/logout")
        } catch {
          // 백엔드 실패해도 로컬 상태는 반드시 초기화
        } finally {
          removeCookie("accessToken")
          removeCookie("refreshToken")
          set({ loggedIn: false, memberGrade: null, activeModal: "NONE", accessToken: null })
        }
      },

      setAccessToken: (token: string | null) => {
        if (token) setCookie("accessToken", token, 1)
        else removeCookie("accessToken")
        set({ accessToken: token });
      },

      setActiveModal: (state: string) => {
        set({ activeModal: state });
      },

      closeModal: () => {
        set({ activeModal: "NONE" });
      },

      setToastMessage: (msg: string | null) => {
        set({ toastMessage: msg });
      },

      setIntroUnlocked: () => {
        set({ introUnlocked: true })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // accessToken은 쿠키로 관리하므로 persist 대상에서 제외
      partialize: (state) => ({
        loggedIn: state.loggedIn,
        memberGrade: state.memberGrade,
        introUnlocked: state.introUnlocked,
      }),
    }
  )
);