import { useState } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';


const AdminMemberPage = () => {
  // 회원 데이터를 관리할 상태 (나중에 API 연동)
  const [members] = useState([
    { id: 1, name: '최유저', email: 'peb@naver.com', phone: '010-9999-8888', penalty: 0, status: '정상' },
    { id: 2, name: '김관리', email: 'admin@test.com', phone: '010-1234-5678', penalty: 1, status: '정지' },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. 사이드바 직접 호출 */}
      <AdminSidebar />

      {/* 2. 메인 콘텐츠 영역 */}
      <div className="flex-1 p-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">회원 관리</h2>
          
          <table className="w-full text-sm text-left">
            <thead className="border-b border-gray-200">
              <tr className="text-gray-400">
                <th className="pb-3">이름</th>
                <th className="pb-3">이메일</th>
                <th className="pb-3">연락처</th>
                <th className="pb-3">패널티</th>
                <th className="pb-3">상태</th>
                <th className="pb-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="py-4">{member.name}</td>
                  <td className="py-4">{member.email}</td>
                  <td className="py-4">{member.phone}</td>
                  <td className="py-4">{member.penalty}회</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded ${member.status === '정상' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-orange-600 font-bold hover:underline">정지/탈퇴</button>
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

export default AdminMemberPage;