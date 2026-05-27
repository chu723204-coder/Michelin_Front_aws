// ── 공통 베이스 ─────────────────────────────────────────────────
export interface IRestaurantBase {
  id: number
  restaurantName: string
  grade: string
  lat: number
  lng: number
}

// ── P2 목록 / 상세 페이지용 (RestaurantListPage, RestaurantDetailPage, MainPage) ──
export interface IRestaurant extends IRestaurantBase {
  images: any
  imageUrls: string[]
  city: string
  district: string
  address: string
  phone: string
  isGreenStar: string
  viewCount: number
  mainImageUrl: string | null
  kakaoPlaceUrl: string
}

// ── MainPage 축약형 (필드 적게 쓰는 경우) ────────────────────────
export interface IRestaurantSummary extends IRestaurantBase {
  district: string
  mainImageUrl: string | null
  category?: string      // ✅ 카테고리 메타 표시용 (응답에 없으면 안전하게 빈값)
  isGreenStar?: string   // ✅ 그린스타 아이콘 조건부 표시용
}

// ── P4 지도 마커용 (RestaurantPage, RestaurantMapContainer) ───────
export interface IRestaurantMarker extends IRestaurantBase {
  markerColor: string
  category: string
  address?: string
  phone?: string
  imageUrl?: string
}