const BASE_URL = "/api/v1/ads"; // ✅ 절대경로 → 상대경로 (vite 프록시 사용)

export interface PopupAdResponse {
  adId: number;
  title: string;
  imageUrl: string;
  landingUrl: string;   // ✅ linkUrl → landingUrl
  startDate: string;
  endDate: string;
  isActive: string;     // ✅ active: boolean → isActive: string
}

export interface PopupAdRequest {
  title: string;
  imageUrl: string;
  landingUrl: string;   // ✅ linkUrl → landingUrl
  startDate: string;
  endDate: string;
  isActive: string;     // ✅ active: boolean → isActive: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const popupService = {

  getActivePopup: async (): Promise<PopupAdResponse | null> => {
    const response = await fetch(`${BASE_URL}/active`);
    if (response.status === 204) return null;
    if (!response.ok) throw new Error("활성 팝업 로드 실패");
    return response.json();
  },

  getAllPopups: async (): Promise<PopupAdResponse[]> => {
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("전체 팝업 목록 로드 실패");
    return response.json();
  },

  createPopup: async (data: PopupAdRequest): Promise<PopupAdResponse> => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("팝업 등록 실패");
    return response.json();
  },

  updatePopup: async (adId: number, data: PopupAdRequest): Promise<PopupAdResponse> => {
    const response = await fetch(`${BASE_URL}/${adId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("팝업 수정 실패");
    return response.json();
  },

  deletePopup: async (adId: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${adId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("팝업 삭제 실패");
  },
};