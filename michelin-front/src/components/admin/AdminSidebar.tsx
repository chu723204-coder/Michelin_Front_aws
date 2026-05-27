import type { HTMLAttributes } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

interface AdminSidebarProps extends HTMLAttributes<HTMLElement> {
  adminName?: string;
  onLogout?: () => void;
}

// 💡 관리자단에 나와야 할 모든 메뉴 목록
const MENU_ITEMS: MenuItem[] = [
  { label: "대시보드",     path: "/admin",            icon: "📊" },
  { label: "회원 관리",     path: "/admin/member",     icon: "👥" },
  { label: "매장 관리",     path: "/admin/restaurant", icon: "🍳" },
  { label: "리뷰/댓글 관리", path: "/admin/review",     icon: "⭐" },
  { label: "공지사항",     path: "/admin/notice",     icon: "📢" },
  { label: "팝업/광고 관리", path: "/admin/popup",      icon: "🎈" },
  { label: "문의 관리",     path: "/admin/inquiry",    icon: "💬" },
  { label: "관리자 관리",   path: "/admin/managers",   icon: "🔑" },
];

export const AdminSidebar = ({
  adminName = "임시 관리자", // 기본값도 편하게 임시로 세팅
  onLogout,
  className = "",
  ...props
}: AdminSidebarProps) => {

  const navigate = useNavigate();
  const location = useLocation();

  // 로그아웃도 에러 없이 홈으로 튕기게만 처리
  const handleLocalLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log("로그아웃 - 메인페이지 이동");
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <aside
      className={`
        w-52 min-h-screen bg-white border-r border-gray-100
        flex flex-col shadow-sm
        ${className}
      `}
      {...props}
    >
      {/* 로고 (미슐랭 테마) */}
      <div
        className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <span className="text-2xl">🍽️</span>
        <span className="text-orange-600 text-lg font-[900] tracking-[-0.02em]">
          Michelin Admin
        </span>
      </div>

      {/* 관리자 프로필 정보 (라벨도 직관적으로 고정) */}
      <div className="px-5 py-4 border-b border-gray-100 bg-orange-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {adminName?.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-purple-100 text-purple-700">
                SUPER
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-orange-100 text-orange-700">
                ALL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 목록 (필터 없이 ALL_MENU_ITEMS를 바로 꽂아서 100% 다 노출) */}
      <nav className="flex-1 py-3">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left px-4 py-2.5 text-sm
                transition-all flex items-center gap-2.5
                ${isActive
                  ? "text-orange-600 bg-orange-50 font-semibold border-r-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 하단 버튼 */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🏠</span>
          <span>메인으로</span>
        </button>
        <button
          onClick={handleLocalLogout}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};