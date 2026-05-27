import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import RestaurantListPage from '../pages/restaurant/RestaurantListPage'
import RestaurantDetailPage from '../pages/restaurant/RestaurantDetailPage'
import RestaurantManagePage from '../pages/restaurant/RestaurantManagePage'
import RestaurantPage from '../pages/RestaurantPage'
import NotFoundPage from '../pages/NotFoundPage'
import NoticesPage from '../pages/NoticesPage'

import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import AuthModal from '../components/common/AuthModal'
import ChatbotWidget from '../components/common/ChatbotWidget'

import AdminManagePage from '../pages/admin/AdminManagePage'
import AdminDashboardPage from '../pages/admin/AdminDaheboard'
import AdminPopupPage from '../pages/admin/AdminPopupPage'
import AdminRestaurant from '../pages/admin/AdminRestaurant'
import AdminMemberPage from '../pages/admin/AdminMemberPage'
import AdminReviewPage from '../pages/admin/AdminReviewPage'
import AdminNoticePage from '../pages/admin/AdminNoticePage'
import MyPage from '../pages/Mypage'
import AdminInquiryPage from '../pages/admin/AdminInquiryPage'

// ✅ introUnlocked 상태 가져오기
import { useAuthStore } from '../store/useAuthStore'

function UserLayout() {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'
  const isMainPage = location.pathname === '/'

  // ✅ introUnlocked 상태 확인
  const { introUnlocked } = useAuthStore()

  // ✅ 메인 페이지이고 인트로가 잠겨있으면 Navbar/Footer/Chatbot 숨김
  const isIntroLocked = isMainPage && !introUnlocked

  return (
    <>
      {/* ✅ 인트로 상태일 때 Navbar 숨김 */}
      {!isIntroLocked && <Navbar />}
      <AuthModal />
      <Outlet />
      {/* ✅ 인트로 상태이거나 지도 페이지일 때 Footer 숨김 */}
      {!isIntroLocked && !isMapPage && <Footer />}
      {/* ✅ 인트로 상태일 때 Chatbot 숨김 */}
      {!isIntroLocked && <ChatbotWidget />}
    </>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/restaurants" element={<RestaurantListPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/restaurants/manage" element={<RestaurantManagePage />} />
          <Route path="/map" element={<RestaurantPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="member" element={<AdminMemberPage />} />
          <Route path="restaurant" element={<AdminRestaurant />} />
          <Route path="review" element={<AdminReviewPage />} />
          <Route path="notice" element={<AdminNoticePage />} />
          <Route path="popup" element={<AdminPopupPage />} />
          <Route path="inquiry" element={<AdminInquiryPage />} />
          <Route path="managers" element={<AdminManagePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter