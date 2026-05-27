import axios from 'axios';

export interface NoticeResponseDto {
  deleteYn: string;
  noticeId: number;
  title: string;
  content: string;
  writerId: string;
  fixYn: 'Y' | 'N';
  formattedDate: string;
  isNew: boolean;
  category?: string  // ✅ 추가 (백엔드 미구현, 폴백용)
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalPages?: number;
  totalElements?: number;
}

const API_BASE_URL = '/api';

export const NoticeService = {
  getCustomerNotices: async (currentPage: number): Promise<ApiResponse<NoticeResponseDto[]>> => {
    try {
      const response = await axios.get<ApiResponse<NoticeResponseDto[]>>(
        `${API_BASE_URL}/notices?page=${currentPage}`
      );
      return response.data;
    } catch (error) {
      console.error("공지사항 호출 에러:", error);
      throw error;
    }
  },

  getNoticeDetail: async (id: number) => {
    return await axios.get(`${API_BASE_URL}/notices/${id}`);
  }
};