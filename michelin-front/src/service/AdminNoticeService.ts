import axios from 'axios';
import type { NoticeResponseDto } from './NoticeService';

// 1. baseURL을 컨트롤러의 @RequestMapping("/api/notices")와 맞춤
const adminApi = axios.create({
  baseURL: 'http://localhost:8080/api/notices',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AdminNoticeService = {
  // [관리자용] 전체 목록 조회: GET /api/notices/admin
getAdminNoticeList: async () => {
    try {
      // 제네릭 타입을 any로 하거나 ApiResponse 형태에 맞게 정의해야 합니다
      const response = await adminApi.get('/admin');
      
      // 💡 여기서 중요! ApiResponse 구조에 따라 실제 데이터가 들어있는 필드를 반환해야 합니다.
      // 보통 response.data.data 형태로 들어있습니다. (만약 ApiResponse의 필드명이 다르면 그에 맞게 수정)
      return response.data.data; 
    } catch (error) {
      console.error("관리자용 목록 조회 에러:", error);
      throw error;
    }
  },

  // [관리자용] 공지사항 등록: POST /api/notices/admin
  registerNotice: async (data: any) => {
    try {
      const response = await adminApi.post<NoticeResponseDto>('/admin', data);
      return response.data;
    } catch (error) {
      console.error("공지사항 등록 에러:", error);
      throw error;
    }
  },

  // [관리자용] 공지사항 수정: PUT /api/notices/admin/{id}
  updateNotice: async (id: number, data: any) => {
    try {
      const response = await adminApi.put<NoticeResponseDto>(`/admin/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("공지사항 수정 에러:", error);
      throw error;
    }
  },

  // [관리자용] 소프트 삭제: DELETE /api/notices/admin/{id}
  deleteNotice: async (id: number) => {
    try {
      await adminApi.delete(`/admin/${id}`);
    } catch (error) {
      console.error("공지사항 삭제 에러:", error);
      throw error;
    }
  },

  // [관리자용] 공지사항 복구: PATCH /api/notices/admin/restore/{id}
  // 컨트롤러가 @PatchMapping("/admin/restore/{noticeId}") 이므로 경로 수정
  restoreNotice: async (id: number) => {
    try {
      await adminApi.patch(`/admin/restore/${id}`);
    } catch (error) {
      console.error("공지사항 복구 에러:", error);
      throw error;
    }
  }
};