import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import type { NoticeResponseDto } from '../../service/NoticeService';
import { AdminNoticeService } from '../../service/AdminNoticeService';
import { AdminNoticeModal } from '../../components/common/admin/AdminNoticeModal';

const AdminNoticePage = () => {
  const [notices, setNotices] = useState<NoticeResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeResponseDto | null>(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await AdminNoticeService.getAdminNoticeList();

      // 💡 정렬 로직: 1순위(활성 'N'을 위로), 2순위(중요 'Y'를 위로), 3순위(나머지)
      const sortedData = [...data].sort((a, b) => {
        // [1] 삭제 여부 구분 (활성 'N'을 위로, 삭제 'Y'를 아래로)
        const aDeleted = a.deleteYn === 'Y' ? 1 : 0;
        const bDeleted = b.deleteYn === 'Y' ? 1 : 0;
        if (aDeleted !== bDeleted) return aDeleted - bDeleted;

        // [2] 삭제 여부가 같을 때 중요 여부 구분 (중요 'Y'를 위로, 일반 'N'을 아래로)
        const aFixed = a.fixYn === 'Y' ? -1 : 1;
        const bFixed = b.fixYn === 'Y' ? -1 : 1;
        if (aFixed !== bFixed) return aFixed - bFixed;

        return 0;
      });

      setNotices(sortedData);
    } catch (error) {
      console.error("목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await AdminNoticeService.deleteNotice(id);
      fetchNotices();
    }
  };

  const handleRestore = async (id: number) => {
    if (window.confirm('해당 공지사항을 복구하시겠습니까?')) {
      await AdminNoticeService.restoreNotice(id);
      fetchNotices();
    }
  };

  

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <div className="flex-1 p-10">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">공지사항 관리</h2>
              <p className="text-sm text-gray-500">전체 {notices.length}건</p>
            </div>
            <button onClick={() => { setEditingNotice(null); setIsModalOpen(true); }} 
                    className="px-5 py-2 bg-[#111] text-white text-sm font-bold">공지사항 등록</button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-t border-b border-gray-200">
              <tr className="text-gray-500 uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3 text-center w-16">번호</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3 text-center">작성자</th>
                <th className="px-4 py-3 text-center">작성일</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="text-center py-10">로딩 중...</td></tr> : 
                notices.map((n) => (
                <tr key={n.noticeId} className={n.deleteYn === 'Y' ? 'bg-gray-50 opacity-70' : ''}>
                  <td className="px-4 py-4 text-center">{n.noticeId}</td>
                  <td className="px-4 py-4 font-medium">
                    {/* 중요 배지 */}
                    {n.fixYn === 'Y' && <span className="mr-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">중요</span>}
                    {/* 삭제됨 배지 */}
                    {n.deleteYn === 'Y' && <span className="mr-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">삭제됨</span>}
                    {n.title}
                  </td>
                  <td className="px-4 py-4 text-center">{n.writerId}</td>
                  <td className="px-4 py-4 text-center">{n.formattedDate}</td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => { setEditingNotice(n); setIsModalOpen(true); }} className="text-blue-600 font-bold mr-3">수정</button>
                    {n.deleteYn === 'Y' ? (
                      <button onClick={() => handleRestore(n.noticeId)} className="text-green-600 font-bold">복구</button>
                    ) : (
                      <button onClick={() => handleDelete(n.noticeId)} className="text-red-500 font-bold">삭제</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <AdminNoticeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchNotices} notice={editingNotice} />}
    </div>
  );
};

export default AdminNoticePage;