import { useState, useEffect } from 'react';
import type { NoticeResponseDto } from '../../../service/NoticeService';
import { AdminNoticeService } from '../../../service/AdminNoticeService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  notice: NoticeResponseDto | null;
}

export const AdminNoticeModal = ({ isOpen, onClose, onSuccess, notice }: ModalProps) => {
  const [formData, setFormData] = useState({ title: '', content: '', fixYn: 'N' as 'Y' | 'N' });

  useEffect(() => {
    if (notice) {
      setFormData({ title: notice.title, content: notice.content, fixYn: notice.fixYn });
    } else {
      setFormData({ title: '', content: '', fixYn: 'N' });
    }
  }, [notice]);

  const handleSubmit = async () => {
    try {
      if (notice) {
        await AdminNoticeService.updateNotice(notice.noticeId, formData);
      } else {
        await AdminNoticeService.registerNotice(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert("저장에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[500px]">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
            {notice ? '공지 수정' : '공지 작성'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* 제목 입력 */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">제목</label>
          <input 
            className="w-full border-b border-gray-300 py-2 focus:border-blue-600 focus:outline-none transition-colors" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="공지 제목을 입력하세요" 
          />
        </div>

        {/* 내용 입력 */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">내용</label>
          <textarea 
            className="w-full border border-gray-300 p-3 h-40 rounded focus:border-blue-600 focus:outline-none" 
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="공지 내용을 입력하세요" 
          />
        </div>

        {/* 상단 고정 체크박스 */}
        <div className="flex items-center mb-8">
          <input 
            type="checkbox" 
            id="fixYn" 
            checked={formData.fixYn === 'Y'} 
            onChange={(e) => setFormData({...formData, fixYn: e.target.checked ? 'Y' : 'N'})}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="fixYn" className="ml-2 text-sm text-gray-700">상단 고정 공지로 설정</label>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
            작성 완료
          </button>
          <button onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};