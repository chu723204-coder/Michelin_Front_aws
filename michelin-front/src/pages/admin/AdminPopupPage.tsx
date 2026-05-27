import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";

const BASE_URL = "/api/v1/ads";

interface PopupAdResponse {
  adId: number;
  title: string;
  imageUrl: string;
  landingUrl: string;
  startDate: string;
  endDate: string;
  isActive: string;
}

interface PopupAdRequest {
  title: string;
  imageUrl: string;
  landingUrl: string;
  startDate: string;
  endDate: string;
  isActive: string;
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// 날짜에서 "T00:00:00" 제거해서 date input에 쓸 수 있게
const toDateInput = (dateStr: string) => dateStr?.split("T")[0] ?? "";

const AdminPopupPage = () => {
  const [popups, setPopups] = useState<PopupAdResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 수정 모드 상태
  const [editTarget, setEditTarget] = useState<PopupAdResponse | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    landingUrl: "",
    startDate: "",
    endDate: "",
  });

  // 1. GET
  const fetchPopups = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(BASE_URL, { headers: authHeaders() });
      if (!res.ok) throw new Error("목록 조회 실패");
      const data: PopupAdResponse[] = await res.json();
      setPopups(data);
    } catch (error) {
      console.error("광고 목록 로드 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 수정 버튼 클릭 → 폼에 기존 데이터 채우기
  const handleEditClick = (popup: PopupAdResponse) => {
    setEditTarget(popup);
    setFormData({
      title: popup.title,
      imageUrl: popup.imageUrl,
      landingUrl: popup.landingUrl,
      startDate: toDateInput(popup.startDate),
      endDate: toDateInput(popup.endDate),
    });
  };

  // ✅ 수정 모드 취소
  const handleCancelEdit = () => {
    setEditTarget(null);
    setFormData({ title: "", imageUrl: "", landingUrl: "", startDate: "", endDate: "" });
  };

  // 2. POST - 등록
  const handleCreatePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const body: PopupAdRequest = {
      ...formData,
      startDate: formData.startDate + "T00:00:00",
      endDate: formData.endDate + "T00:00:00",
      isActive: "Y",
    };

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("등록 실패");

      alert("팝업 광고가 성공적으로 등록되었습니다! 🎉");
      setFormData({ title: "", imageUrl: "", landingUrl: "", startDate: "", endDate: "" });
      fetchPopups();
    } catch (error) {
      console.error("등록 통신 에러", error);
      alert("광고 등록에 실패했습니다.");
    }
  };

  // ✅ PUT - 수정 저장
  const handleUpdatePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const body: PopupAdRequest = {
      ...formData,
      startDate: formData.startDate + "T00:00:00",
      endDate: formData.endDate + "T00:00:00",
      isActive: editTarget.isActive, // 수정 시 기존 활성 상태 유지
    };

    try {
      const res = await fetch(`${BASE_URL}/${editTarget.adId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("수정 실패");

      alert("광고가 수정되었습니다! ✏️");
      handleCancelEdit();
      fetchPopups();
    } catch (error) {
      console.error("수정 통신 에러", error);
      alert("광고 수정에 실패했습니다.");
    }
  };

  // PUT - 토글
  const handleToggleActive = async (popup: PopupAdResponse) => {
    const body: PopupAdRequest = {
      title: popup.title,
      imageUrl: popup.imageUrl,
      landingUrl: popup.landingUrl,
      startDate: popup.startDate,
      endDate: popup.endDate,
      isActive: popup.isActive === "Y" ? "N" : "Y",
    };

    try {
      const res = await fetch(`${BASE_URL}/${popup.adId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("상태 변경 실패");
      fetchPopups();
    } catch (error) {
      console.error("상태 변경 실패", error);
    }
  };

  // DELETE
  const handleDeletePopup = async (adId: number) => {
    if (!window.confirm("정말 이 광고를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${BASE_URL}/${adId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("삭제 실패");

      setPopups(popups.filter((p) => p.adId !== adId));
      alert("광고가 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패", error);
      alert("광고 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const isEditMode = editTarget !== null;

  return (
    <AdminLayout>
      <AdminPageHeader title="팝업/광고 관리" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 등록 / 수정 폼 */}
        <div className={`bg-white border rounded-xl shadow-sm p-5 h-fit transition-colors ${
          isEditMode ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-100"
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-1 h-4 ${isEditMode ? "bg-blue-500" : "bg-orange-600"}`} />
            <h2 className="text-sm font-semibold text-gray-700">
              {isEditMode ? `✏️ 광고 수정 중 (ID #${editTarget.adId})` : "새 광고 등록"}
            </h2>
          </div>

          <form onSubmit={isEditMode ? handleUpdatePopup : handleCreatePopup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">광고 제목 *</label>
              <input
                type="text"
                placeholder="광고 제목 입력"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">이미지 URL</label>
              <input
                type="text"
                placeholder="이미지 주소 붙여넣기"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">연결 링크 URL</label>
              <input
                type="text"
                placeholder="/restaurants/1 등"
                value={formData.landingUrl}
                onChange={(e) => setFormData({ ...formData, landingUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">시작일 *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">종료일 *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 text-white font-medium text-sm rounded-lg shadow-sm transition-colors ${
                  isEditMode
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {isEditMode ? "✏️ 수정 저장" : "🚀 등록"}
              </button>

              {/* ✅ 수정 모드일 때만 취소 버튼 표시 */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm rounded-lg transition-colors"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 리스트 테이블 */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-orange-600" />
              <h2 className="text-sm font-semibold text-gray-700">등록된 광고 리스트</h2>
              <span className="text-xs text-gray-400">총 {popups.length}건</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 font-medium tracking-wide">
                  <th className="text-left px-5 py-3 w-16">ID</th>
                  <th className="text-left px-5 py-3">광고 정보</th>
                  <th className="text-left px-5 py-3 w-44">노출 기간</th>
                  <th className="text-center px-5 py-3 w-24">상태</th>
                  <th className="text-center px-5 py-3 w-28">관리</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-300">로딩 중...</td>
                  </tr>
                ) : popups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-300">등록된 광고가 없습니다.</td>
                  </tr>
                ) : (
                  popups.map((popup) => (
                    <tr
                      key={popup.adId}
                      className={`border-b border-gray-50 transition-colors ${
                        editTarget?.adId === popup.adId
                          ? "bg-blue-50"           // ✅ 수정 중인 행 하이라이트
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="px-5 py-4 text-gray-400">#{popup.adId}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-700 line-clamp-1">{popup.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          🔗 링크: {popup.landingUrl || "없음"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {toDateInput(popup.startDate)} ~ {toDateInput(popup.endDate)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(popup)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                            popup.isActive === "Y"
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {popup.isActive === "Y" ? "● 노출중" : "○ 중지됨"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* ✅ 수정 버튼 추가 */}
                          <button
                            onClick={() => handleEditClick(popup)}
                            className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeletePopup(popup.adId)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPopupPage;