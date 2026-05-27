import axios from 'axios';

const API_BASE_URL = '/api/restaurants';

export const AdminRestaurantService = {
  // 1. 목록 조회 (검색/페이지네이션)
  getList: (params: any) => axios.get(API_BASE_URL, { params }),

  // 2. 상세 조회
  getDetail: (id: number) => axios.get(`${API_BASE_URL}/${id}`),

  // 3. 등록
  create: (formData: FormData) => axios.post(API_BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 4. 수정
  update: (id: number, formData: FormData) => axios.put(`${API_BASE_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 5. 삭제
  delete: (id: number) => axios.delete(`${API_BASE_URL}/${id}`),

  // 6. 이미지 업로드
 uploadImage: (id: number, file: FormData, isMain: boolean = false) =>
  axios.post(`${API_BASE_URL}/${id}/images`, file, {
    params: { isMain },  // ✅ isMain 쿼리 파라미터로 전송
  }),

  // 7. 이미지 삭제 (백엔드는 imageId만 사용, restaurantId는 URL 경로용)
  deleteImage: (restaurantId: number, imageId: number) =>
    axios.delete(`${API_BASE_URL}/${restaurantId}/images/${imageId}`),

  // 8. 이미지 목록 조회
  getImages: (id: number) => axios.get(`${API_BASE_URL}/${id}/images`),

  // 9. 자동완성
  getAutocomplete: (keyword: string) => axios.get(`${API_BASE_URL}/autocomplete`, { params: { keyword } }),

  // 10. 마커 조회
  getMarkers: (lat: number, lng: number) => axios.get(`${API_BASE_URL}/markers`, { params: { lat, lng } }),

  // 11. 이름 검색
  search: (name: string) => axios.get(`${API_BASE_URL}/search`, { params: { name } }),
};