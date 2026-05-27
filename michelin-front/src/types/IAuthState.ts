export interface IAuthState {
    loggedIn: boolean|null;
    memberGrade: string | null;
    activeModal: string;
    accessToken: string | null;
    toastMessage: string | null;
    introUnlocked: boolean        // ← 추가
    login: (grade: string, token: string) => void;
    logout: ()=> void;
    setAccessToken: (token: string | null) => void;
    setActiveModal: (state: any) => void;
    closeModal: () => void;
    setToastMessage: (msg: string | null) => void;
    setIntroUnlocked: () => void  // ← 추가
}