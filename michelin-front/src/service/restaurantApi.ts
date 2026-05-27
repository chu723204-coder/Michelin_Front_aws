import api from './api'

// 맛집 목록 조회 (필터 + 페이지네이션)
export const getRestaurantList = (params?: {
  grade?: string
  city?: string
  district?: string
  isGreenStar?: string
  keyword?: string
  page?: number
  size?: number
}) => {
  return api.get('/restaurants', { params })
}

// 맛집 상세 조회
export const getRestaurantDetail = (id: number) => {
  return api.get(`/restaurants/${id}`)
}

// 맛집 등록
export const createRestaurant = (data: FormData) => {
  return api.post('/restaurants', data)
}

// 맛집 수정
export const updateRestaurant = (id: number, data: FormData) => {
  return api.put(`/restaurants/${id}`, data)
}

// 맛집 삭제
export const deleteRestaurant = (id: number) => {
  return api.delete(`/restaurants/${id}`)
}

// 검색 자동완성
export const getSearchAutocomplete = (keyword: string) => {
  return api.get('/restaurants/autocomplete', { params: { keyword } })
}

// 지도 마커 조회 (P4 연동)
export const getRestaurantMarkers = (lat: number, lng: number) => {
  return api.get('/restaurants/markers', { params: { lat, lng } })
}

// ✅ 이름 검색 (P4 연동)
export const searchRestaurantsByName = (name: string) => {
  return api.get('/restaurants/search', { params: { name } })
}