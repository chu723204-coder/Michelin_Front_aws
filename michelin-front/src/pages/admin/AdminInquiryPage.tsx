import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

const AdminInquiryPage = () => {
  const [inquiries] = useState([]);
  const [, setLoading] = useState(false);

  // 데이터 조회 로직 (나중에 API 연결)
  const fetchInquiries = async () => {
    setLoading(true);
    // const data = await AdminInquiryService.getList();
    // setInquiries(data);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <div className="flex-1 p-10">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          {/* 1. 페이지 헤더 */}
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">문의 관리</h2>

          {/* 2. 상단 통계 영역 */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">문의 목록 총 {inquiries.length}건</p>
            <div className="flex gap-4 text-sm font-bold">
              <span className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>미답변 0건</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>답변완료 0건</span>
              <select className="border border-gray-300 rounded px-2 py-1 ml-4">
                <option>최신순</option>
                <option>오래된순</option>
              </select>
            </div>
          </div>

          {/* 3. 테이블 */}
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-t border-b border-gray-200">
              <tr className="text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3 text-center w-16">번호</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3 text-center">회원 ID</th>
                <th className="px-4 py-3 text-center">작성일</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-gray-400">등록된 문의가 없습니다</td>
                </tr>
              ) : (
                inquiries.map((item: any) => (
                  <tr key={item.id}>
                    {/* 데이터 렌더링 영역 */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInquiryPage;