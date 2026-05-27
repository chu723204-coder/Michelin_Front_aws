import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

// 대시보드에 표시할 통계 데이터 DTO 인터페이스
interface DashboardStatsDto {
  totalMembers: number;
  totalRestaurants: number;
  newReviewsToday: number;
  activePopups: number;
}

// 최근 등록된 매장 간이 인터페이스
interface RecentRestaurantDto {
  restaurantId: number;
  name: string;
  category: string;
  regDate: string;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStatsDto>({
    totalMembers: 0,
    totalRestaurants: 0,
    newReviewsToday: 0,
    activePopups: 0,
  });
  const [recentRestaurants, setRecentRestaurants] = useState<RecentRestaurantDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const BASE_URL = "http://localhost:8080/api/v1/admin/dashboard"; // 대시보드 전용 백엔드 주소 가정

  // 대시보드 통계 및 최근 데이터 Fetch
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // 💡 실제 백엔드 연동 전까지는 안전하게 dummy/기본값이 노출되며, API 연결 시 활성화하시면 됩니다.
      const response = await fetch(`${BASE_URL}/stats`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentRestaurants(data.recentRestaurants);
      }
    } catch (error) {
      console.error("대시보드 데이터 로드 실패 (더미 데이터 적용)", error);
      // 백엔드 연결 전 UI 확인용 데모 데이터
      setStats({
        totalMembers: 1240,
        totalRestaurants: 85,
        newReviewsToday: 42,
        activePopups: 3,
      });
      setRecentRestaurants([
        { restaurantId: 1, name: "맛찬들 왕소금구이", category: "한식", regDate: "2026-05-19" },
        { restaurantId: 2, name: "오스테리아 샘킴", category: "양식", regDate: "2026-05-18" },
        { restaurantId: 3, name: "스시호시", category: "일식", regDate: "2026-05-17" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      {/* 💡 상단 대시보드 헤더 */}
      <AdminPageHeader title="대시보드" />

      {/* 📈 1. 상단 핵심 요약 통계 카드 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 회원 통계 */}
        <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">전체 회원 수</p>
            <h3 className="text-2xl font-bold text-gray-700 mt-1">
              {isLoading ? "..." : `${stats.totalMembers.toLocaleString()}명`}
            </h3>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center text-xl font-bold">
            👥
          </div>
        </div>

        {/* 매장 통계 */}
        <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">등록된 매장 수</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-1">
              {isLoading ? "..." : `${stats.totalRestaurants.toLocaleString()}개`}
            </h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl font-bold">
            🍳
          </div>
        </div>

        {/* 리뷰 통계 */}
        <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">오늘 신규 리뷰</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {isLoading ? "..." : `${stats.newReviewsToday.toLocaleString()}건`}
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center text-xl font-bold">
            ⭐
          </div>
        </div>

        {/* 팝업 광고 통계 */}
        <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">진행 중인 팝업</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
              {isLoading ? "..." : `${stats.activePopups.toLocaleString()}개`}
            </h3>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-xl font-bold">
            🎈
          </div>
        </div>
      </div>

      {/* 📋 2. 하단 데이터 테이블 영역 (현재 스크린샷의 카드 레이아웃 양식 그대로 차용) */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-orange-600" />
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide">최근 등록된 매장 현황</h2>
            <span className="text-xs text-gray-400">신규 {recentRestaurants.length}건</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-24">매장 번호</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide">매장 이름</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-32">카테고리</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium tracking-wide w-40">등록 일자</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-300">
                    데이터를 분석 중입니다...
                  </td>
                </tr>
              ) : recentRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-300">
                    최근 새로 등록된 매장이 없습니다.
                  </td>
                </tr>
              ) : (
                recentRestaurants.map((shop) => (
                  <tr key={shop.restaurantId} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 text-gray-400">#{shop.restaurantId}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">{shop.name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs bg-orange-50 text-orange-700 rounded-full font-medium">
                        {shop.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{shop.regDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;