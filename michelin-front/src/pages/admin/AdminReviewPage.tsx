import { useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
// ... 필요한 서비스 및 컴포넌트 임포트

const AdminCommentPage = () => {
  const [comments] = useState([]);
  const [, setFilter] = useState('ALL'); // ALL, ACTIVE, DELETED, REPORTED

  // 댓글 목록 조회 (신고 건수 포함)
  const fetchComments = async () => {
    // API 호출 로직
  };

  const handleAction = async ( action: 'DELETE' | 'RESTORE' | 'BLOCK') => {
    if (window.confirm(`${action} 하시겠습니까?`)) {
      // 삭제/복구/블라인드 처리 API 호출
      fetchComments();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <div className="flex-1 p-10">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          {/* 1. 상단 컨트롤 영역: 검색 및 필터 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">리뷰/댓글 관리</h2>
            <div className="flex gap-2">
              <select onChange={(e) => setFilter(e.target.value)} className="border p-2 text-sm rounded">
                <option value="ALL">전체 상태</option>
                <option value="ACTIVE">활성</option>
                <option value="REPORTED">신고됨</option>
                <option value="DELETED">삭제됨</option>
              </select>
            </div>
          </div>

          {/* 2. 관리 테이블 */}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3 text-center">신고수</th>
                <th className="px-4 py-3 text-center">작성일</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((c: any) => (
                <tr key={c.id} className={c.status === 'DELETED' ? 'bg-red-50' : ''}>
                  <td className="px-4 py-4">{c.writer}</td>
                  <td className="px-4 py-4 max-w-xs truncate">{c.content}</td>
                  <td className="px-4 py-4 text-center">
                    {c.reportCount > 0 && <span className="text-red-500 font-bold">{c.reportCount}</span>}
                  </td>
                  <td className="px-4 py-4 text-center">{c.createdAt}</td>
                  <td className="px-4 py-4 text-center">
                    {c.status === 'DELETED' ? (
                      <button onClick={() => handleAction( 'RESTORE')} className="text-green-600 font-bold">복구</button>
                    ) : (
                      <button onClick={() => handleAction( 'DELETE')} className="text-red-500 font-bold">삭제</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCommentPage;