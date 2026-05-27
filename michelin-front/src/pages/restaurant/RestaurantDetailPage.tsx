import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRestaurantDetail } from "../../service/restaurantApi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsBookmarkFill, BsBookmark, BsShare } from "react-icons/bs";
import axios from "axios";
import Modal from "../../components/common/Modal";
import type { IRestaurant } from "../../types/IRestaurant";
import ReviewSection from "../../components/review/ReviewSection";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800";

const gradeLabel = (grade: string) => {
  if (grade === "1스타") return "★ 1 STAR";
  if (grade === "빕 구르망") return "BIB GOURMAND";
  return "SELECTED";
};

const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0 }
    100% { background-position:  600px 0 }
  }
  .skeleton {
    background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .skeleton-dark {
    background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
`;

function SkeletonBlock({ className = "skeleton", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={{ borderRadius: 0, ...style }} />;
}

function DetailPageSkeleton() {
  return (
    <div style={{ fontFamily: "'Space Mono', monospace", background: "#fdfdfd", minHeight: "100vh" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[420px]">
        <SkeletonBlock className="skeleton-dark" style={{ height: "260px" }} />
        <div className="bg-[#111] flex flex-col justify-end p-6 sm:p-8 md:p-10 gap-3">
          <SkeletonBlock className="skeleton-dark" style={{ width: "80px", height: "18px" }} />
          <SkeletonBlock className="skeleton-dark" style={{ width: "70%", height: "36px" }} />
          <SkeletonBlock className="skeleton-dark" style={{ width: "45%", height: "36px" }} />
          <SkeletonBlock className="skeleton-dark" style={{ width: "120px", height: "12px", marginTop: "4px" }} />
          <SkeletonBlock className="skeleton-dark" style={{ width: "100px", height: "10px", marginTop: "auto" }} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 px-4 sm:px-8 lg:px-[5vw] py-8 lg:py-12">
        <div>
          <div className="mb-8 pb-8 border-b border-[#eee]">
            <SkeletonBlock style={{ width: "120px", height: "10px", marginBottom: "16px" }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-[10px] border-b border-[#eee]">
                <SkeletonBlock style={{ width: "60px", height: "10px" }} />
                <SkeletonBlock style={{ width: `${80 + (i % 3) * 40}px`, height: "10px" }} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="border border-[#eee] p-5">
            <SkeletonBlock style={{ width: "100px", height: "10px", marginBottom: "16px" }} />
            <SkeletonBlock style={{ height: "36px", marginBottom: "16px" }} />
            <SkeletonBlock style={{ width: "80px", height: "10px", margin: "0 auto" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const memberId = localStorage.getItem("memberId");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    fetchDetail();
    if (id && memberId) fetchSocialStatus();
  }, [id, memberId]);

  useEffect(() => {
    if (restaurant) document.title = `${restaurant.restaurantName} | MICHELIN`;
  }, [restaurant]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getRestaurantDetail(Number(id));
      setRestaurant(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSocialStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/social/status`, { params: { memberId, restaurantId: id } });
      setIsLiked(res.data.isLiked);
      setIsBookmarked(res.data.isBookmarked);
    } catch (e) { console.error("Social status fetch error:", e); }
  };

  const checkLogin = () => {
    if (!memberId || memberId === "null") { setIsLoginModalOpen(true); return false; }
    return true;
  };

  const handleLike = async () => {
    if (!checkLogin()) return;
    try {
      const res = await axios.post(`http://localhost:8080/api/social/like`, { memberId: Number(memberId), restaurantId: Number(id) });
      setIsLiked(res.data);
    } catch (e) { console.error(e); }
  };

  const handleBookmark = async () => {
    if (!checkLogin()) return;
    try {
      const res = await axios.post(`http://localhost:8080/api/social/bookmark`, { memberId: Number(memberId), restaurantId: Number(id) });
      setIsBookmarked(res.data);
    } catch (e: any) {
      if (e.response?.status === 500) {
        alert("세션 정보가 만료되었거나 잘못된 사용자 정보입니다. 다시 로그인해주세요.");
        localStorage.removeItem("memberId");
        navigate("/login");
      }
      console.error(e);
    }
  };

  const handleShare = async () => {
    const shareData = { title: restaurant?.restaurantName, text: `${restaurant?.restaurantName}의 미슐랭 정보를 확인해보세요!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error("공유 실패:", err); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다!");
    }
  };

  const openKakaoMap = () => { if (restaurant?.kakaoPlaceUrl) window.open(restaurant.kakaoPlaceUrl, "_blank"); };

  if (loading) return (<><style>{shimmerStyle}</style><DetailPageSkeleton /></>);

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
      <p className="text-[11px] tracking-[3px] text-[#aaa]" style={{ fontFamily: "'Space Mono', monospace" }}>RESTAURANT NOT FOUND</p>
    </div>
  );

  const infoRows = [
    { label: "GRADE", value: gradeLabel(restaurant.grade), color: "text-[#e62117]" },
    { label: "ADDRESS", value: restaurant.address || "-", color: "text-[#111]" },
    { label: "PHONE", value: restaurant.phone || "-", color: "text-[#111]" },
    { label: "REGION", value: `${restaurant.district} · ${restaurant.city}`, color: "text-[#111]" },
    { label: "GREEN STAR", value: restaurant.isGreenStar === "Y" ? "🌿 YES" : "-", color: "text-[#111]" },
    { label: "VIEWS", value: String(restaurant.viewCount), color: "text-[#111]" },
  ];

  return (
    <div className="bg-[#fdfdfd] min-h-screen" style={{ fontFamily: "'Space Mono', monospace" }}>

      {/* ── 1. 히어로 섹션 ──────────────────────────────── */}
<div className="grid grid-cols-1 md:grid-cols-2 h-[260px] md:h-[420px]">
  <div className="relative overflow-hidden bg-[#1a1a1a]">
    <img key={restaurant.mainImageUrl} src={restaurant.mainImageUrl || FALLBACK_IMAGE} alt={restaurant.restaurantName} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="w-full h-full object-cover object-center" />
  </div>
  <div className="relative overflow-hidden bg-[#111] flex flex-col justify-end">
    <img key={restaurant.imageUrls?.find(url => url !== restaurant.mainImageUrl) ?? 'fallback'} src={restaurant.imageUrls ? restaurant.imageUrls.find(url => url !== restaurant.mainImageUrl) || FALLBACK_IMAGE : FALLBACK_IMAGE} alt="Sub View" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="absolute inset-0 w-full h-full object-cover object-center" />
    <div className="relative z-10 p-6 sm:p-8 md:p-10">
      <div className="inline-block border border-[#e62117] text-[#e62117] text-[8px] tracking-[1.5px] px-3 py-[2px] mb-3 self-start">{gradeLabel(restaurant.grade)}</div>
      <h1 className="text-white text-2xl sm:text-3xl md:text-[2.5rem] font-medium leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-1px" }}>{restaurant.restaurantName}</h1>
      <p className="text-[9px] tracking-[3px] text-white/40 mb-6">{restaurant.district} · {restaurant.city}</p>
      <button onClick={() => navigate("/restaurants")} className="text-[9px] tracking-[2px] text-white/30 hover:text-white/60 transition-colors mt-auto text-left cursor-pointer bg-transparent border-none">← BACK TO LIST</button>
    </div>
  </div>
</div>

      {/* ── 2. 본문 섹션 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 px-4 sm:px-8 lg:px-[5vw] py-8 lg:py-12">
        <div>
          <section className="mb-8 pb-8 border-b border-[#eee]">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">RESTAURANT INFO</p>
            {infoRows.map((row, i) => (
              <div key={i} className="flex justify-between items-center text-[11px] py-[10px] border-b border-[#eee] gap-4">
                <span className="text-[#aaa] tracking-[1px] shrink-0">{row.label}</span>
                <span className={`${row.color} tracking-[1px] text-right break-all`}>{row.value}</span>
              </div>
            ))}
          </section>
        </div>

        {/* 사이드바 */}
        <div className="space-y-3">
          <div className="border border-[#eee] p-5">
            <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">QUICK ACTION</p>
            <div className="flex gap-2 mb-3">
              <button onClick={handleLike} className="flex-1 py-[12px] bg-white border border-[#eee] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#f9f9f9] transition-all group">
                {isLiked ? <AiFillHeart className="text-[#e62117] text-xl" /> : <AiOutlineHeart className="text-[#ccc] text-xl group-hover:text-[#e62117]" />}
                <span className="text-[8px] tracking-[1px] text-[#666]">{isLiked ? "LIKED" : "LIKE"}</span>
              </button>
              <button onClick={handleBookmark} className="flex-1 py-[12px] bg-white border border-[#eee] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#f9f9f9] transition-all group">
                {isBookmarked ? <BsBookmarkFill className="text-[#fbc02d] text-lg" /> : <BsBookmark className="text-[#ccc] text-lg group-hover:text-[#fbc02d]" />}
                <span className="text-[8px] tracking-[1px] text-[#666]">{isBookmarked ? "SAVED" : "SAVE"}</span>
              </button>
              <button onClick={handleShare} className="flex-1 py-[12px] bg-white border border-[#eee] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#f9f9f9] transition-all group">
                <BsShare className="text-[#ccc] text-lg group-hover:text-[#111]" />
                <span className="text-[8px] tracking-[1px] text-[#666]">SHARE</span>
              </button>
            </div>
            {restaurant.kakaoPlaceUrl && (
              <button onClick={openKakaoMap} className="block w-full py-[10px] bg-[#FEE500] text-[#111] text-[10px] tracking-[2px] text-center border-none cursor-pointer hover:brightness-95 transition-all mb-2">
                카카오맵에서 보기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. 리뷰 섹션 ────────────────────────────────── */}
      <div className="border-t border-[#eee]">
        <ReviewSection restaurantId={Number(id)} />
      </div>

      {/* ── 4. 로그인 유도 모달 ──────────────────────────── */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="LOGIN REQUIRED">
        <div className="flex flex-col gap-6">
          <p className="text-[#64748B] text-[15px] leading-relaxed">이 서비스는 로그인이 필요합니다.<br />로그인 페이지로 이동하시겠습니까?</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate("/login")} className="flex-1 py-3 bg-[#111] text-white text-[11px] tracking-[2px] font-bold hover:bg-[#333] transition-colors">GO TO LOGIN</button>
            <button onClick={() => setIsLoginModalOpen(false)} className="flex-1 py-3 bg-[#eee] text-[#666] text-[11px] tracking-[2px] font-bold hover:bg-[#e5e5e5] transition-colors">LATER</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RestaurantDetailPage;