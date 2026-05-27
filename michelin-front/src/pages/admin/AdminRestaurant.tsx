import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminRestaurantService } from '../../service/AdminRestaurant';


interface Restaurant {
  id: number;
  restaurantName: string;
  grade: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  isGreenStar: string;
  address: string;
  kakaoPlaceUrl: string;
  kakaoPlaceId: string;
  phone: string;
  category: string;
  viewCount: number;
}

const AdminRestaurant = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredData, setFilteredData] = useState<Restaurant[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('전체');
  const [isLoading, setIsLoading] = useState(false);

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Restaurant | null>(null);

  // ✅ 이미지 파일 상태
  const [restaurantFiles, setRestaurantFiles] = useState<FileList | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [menuFile, setMenuFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    restaurantName: '',
    grade: '선정 레스토랑',
    city: '',
    district: '',
    lat: '',
    lng: '',
    isGreenStar: 'N',
    address: '',
    kakaoPlaceUrl: '',
    kakaoPlaceId: '',
    phone: '',
    category: '한식',
  });


  // 1. GET - 목록 조회
const fetchRestaurants = async () => {
  try {
    setIsLoading(true);
    const res = await AdminRestaurantService.getList({ page: 0, size: 1000 });
    const sorted = (res.data.data.content ?? []).sort(
      (a: Restaurant, b: Restaurant) =>
        (GRADE_ORDER[a.grade] ?? 99) - (GRADE_ORDER[b.grade] ?? 99)
    );
    setRestaurants(sorted);  // ✅ sorted로 변경
  } catch (error) {
    console.error('목록 조회 실패', error);
  } finally {
    setIsLoading(false);
  }
};

const GRADE_ORDER: Record<string, number> = {
  '3스타': 1,
  '2스타': 2,
  '1스타': 3,
  '빕 구르망': 4,
  '선정 레스토랑': 5,
};


  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedGrade === '전체') {
      setFilteredData(restaurants);
    } else {
      setFilteredData(restaurants.filter((item) => item.grade === selectedGrade));
    }
  }, [selectedGrade, restaurants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (item: Restaurant) => {
    setSelectedItem(item);
    setFormData({ ...item, lat: String(item.lat), lng: String(item.lng) });
    setRestaurantFiles(null);
    setMenuFile(null);
    setMainImageIndex(0);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsRegModalOpen(false);
    setIsEditModalOpen(false);
    setRestaurantFiles(null);
    setMenuFile(null);
    setMainImageIndex(0);
  };

  // ✅ FormData 빌더 (등록/수정 공통)
  const buildFormData = () => {
    const form = new FormData();

    // requestDto를 JSON Blob으로 묶어서 전송 (@RequestPart("requestDto") 맞춤)
    const requestDto = {
      restaurantName: formData.restaurantName,
      grade: formData.grade,
      city: formData.city,
      district: formData.district,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      isGreenStar: formData.isGreenStar,
      address: formData.address,
      kakaoPlaceUrl: formData.kakaoPlaceUrl,
      kakaoPlaceId: formData.kakaoPlaceId,
      phone: formData.phone,
      category: formData.category,
    };
    form.append('requestDto', new Blob([JSON.stringify(requestDto)], { type: 'application/json' }));

    // 식당 이미지 파일들
    if (restaurantFiles) {
      Array.from(restaurantFiles).forEach((file) => {
        form.append('files', file);
      });
    }

    return form;
  };

// 2. POST - 등록
const handleCreate = async () => {
  if (!formData.restaurantName) {
    alert('매장 이름을 입력해주세요.');
    return;
  }

  try {
    const form = buildFormData();
    const res = await AdminRestaurantService.create(form);
    const newId = res.data.data.id; // ✅ 등록된 식당 ID

    // ✅ 식당 이미지 업로드
    if (restaurantFiles && restaurantFiles.length > 0) {
      await Promise.all(
        Array.from(restaurantFiles).map((file, index) => {
          const imgForm = new FormData();
          imgForm.append('file', file);
          const isMain = index === mainImageIndex;
          return AdminRestaurantService.uploadImage(newId, imgForm, isMain);
        })
      );
    }

    // ✅ 메뉴 이미지 업로드
    if (menuFile) {
      const menuForm = new FormData();
      menuForm.append('file', menuFile);
      await AdminRestaurantService.uploadImage(newId, menuForm, false);
    }

    alert('매장이 등록되었습니다! 🎉');
    closeModal();
    fetchRestaurants();
  } catch (error) {
    console.error('등록 실패', error);
    alert('매장 등록에 실패했습니다.');
  }
};

// 3. PUT - 수정
const handleUpdate = async () => {
  if (!selectedItem) return;
  if (!formData.restaurantName) {
    alert('매장 이름을 입력해주세요.');
    return;
  }

  try {
    const form = buildFormData();
    await AdminRestaurantService.update(selectedItem.id, form);

// ✅ 새 이미지가 있으면 기존 이미지 먼저 전부 삭제 후 새로 업로드
if (restaurantFiles && restaurantFiles.length > 0) {
  const existingImages = await AdminRestaurantService.getImages(selectedItem.id);
  console.log("이미지 응답:", existingImages.data); // ✅ 구조 확인용

  const images = Array.isArray(existingImages.data.data)
    ? existingImages.data.data
    : Array.isArray(existingImages.data)
    ? existingImages.data
    : [];

  // 기존 이미지 전부 삭제
  await Promise.all(
    images.map((img: any) =>
      AdminRestaurantService.deleteImage(selectedItem.id, img.id)
    )
  );

  // 새 이미지 업로드
  await Promise.all(
    Array.from(restaurantFiles).map((file, index) => {
      const imgForm = new FormData();
      imgForm.append('file', file);
      const isMain = index === mainImageIndex;
      return AdminRestaurantService.uploadImage(selectedItem.id, imgForm, isMain);
    })
  );
}

    // ✅ 메뉴 이미지 업로드
    if (menuFile) {
      const menuForm = new FormData();
      menuForm.append('file', menuFile);
      await AdminRestaurantService.uploadImage(selectedItem.id, menuForm, false);
    }

    alert('매장 정보가 수정되었습니다! ✏️');
    closeModal();
    fetchRestaurants();
  } catch (error) {
    console.error('수정 실패', error);
    alert('매장 수정에 실패했습니다.');
  }
};

// 4. DELETE - 삭제 (변경 없음)
const handleDelete = async () => {
  if (!selectedItem) return;

  try {
    await AdminRestaurantService.delete(selectedItem.id);
    alert('매장이 삭제되었습니다.');
    setIsDelModalOpen(false);
    fetchRestaurants();
  } catch (error) {
    console.error('삭제 실패', error);
    alert('매장 삭제에 실패했습니다.');
  }
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">매장 관리</h2>
<input 
  type="text"
  placeholder="매장명 검색..."
  className="p-2.5 border rounded-lg text-sm w-48"
  onChange={(e) => {
    const keyword = e.target.value.toLowerCase();
    setFilteredData(restaurants.filter(item => 
      item.restaurantName.toLowerCase().includes(keyword)
    ));
  }}
/>
          <div className="flex items-center gap-3">
            <select
              className="p-2.5 border rounded-lg bg-white text-sm"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="전체">전체 등급</option>
              <option value="3스타">3스타</option>
              <option value="2스타">2스타</option>
              <option value="1스타">1스타</option>
              <option value="빕 구르망">빕 구르망</option>
              <option value="선정 레스토랑">선정 레스토랑</option>
            </select>

            <button
              onClick={() => { setFormData({ restaurantName: '', grade: '선정 레스토랑', city: '', district: '', lat: '', lng: '', isGreenStar: 'N', address: '', kakaoPlaceUrl: '', kakaoPlaceId: '', phone: '', category: '한식' }); setIsRegModalOpen(true); }}
              className="px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              신규 등록
            </button>
          </div>
        </div>

        {/* 목록 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">매장명</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">등급</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">카테고리</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">지역</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-300">로딩 중...</td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.restaurantName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                      item.grade.includes('스타') ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-gray-600">{item.city} {item.district}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => openEditModal(item)} className="text-blue-600 hover:underline">수정</button>
                    <button onClick={() => { setSelectedItem(item); setIsDelModalOpen(true); }} className="text-red-600 hover:underline">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filteredData.length === 0 && (
            <div className="p-20 text-center text-gray-400">등록된 매장이 없습니다.</div>
          )}
        </div>
      </main>

      {/* 등록/수정 모달 */}
      {(isRegModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold">{isRegModalOpen ? '신규 매장 등록' : '매장 정보 수정'}</h3>
              <button onClick={closeModal} className="text-2xl text-gray-400">&times;</button>
            </div>

            <form className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">매장 이름</label>
                  <input name="restaurantName" value={formData.restaurantName} onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">등급</label>
                  <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                    <option value="3스타">3스타</option>
                    <option value="2스타">2스타</option>
                    <option value="1스타">1스타</option>
                    <option value="빕 구르망">빕 구르망</option>
                    <option value="선정 레스토랑">선정 레스토랑</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">카테고리</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                    <option value="한식">한식</option>
                    <option value="일식">일식</option>
                    <option value="중식">중식</option>
                    <option value="양식">양식</option>
                    <option value="아시안">아시안</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">위도 (LAT)</label>
                  <input name="lat" value={formData.lat} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">경도 (LNG)</label>
                  <input name="lng" value={formData.lng} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">전화번호</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">그린스타 여부</label>
                  <select name="isGreenStar" value={formData.isGreenStar} onChange={handleInputChange} className="w-full p-3 border rounded-lg">
                    <option value="N">아니오 (N)</option>
                    <option value="Y">예 (Y)</option>
                  </select>
                </div>
                {/* [추가된 도시/구 필드] */}
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">도시</label>
      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="예: 서울특별시" className="w-full p-3 border rounded-lg" />
    </div>
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">구/군</label>
      <input name="district" value={formData.district} onChange={handleInputChange} placeholder="예: 강남구" className="w-full p-3 border rounded-lg" />
    </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">주소</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">카카오 장소 ID</label>
                  <input name="kakaoPlaceId" value={formData.kakaoPlaceId} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">카카오 지도 URL</label>
                  <input name="kakaoPlaceUrl" value={formData.kakaoPlaceUrl} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
              </div>

              {/* 이미지 업로드 */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">식당 이미지 (여러 장 선택 가능)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full text-sm"
                    onChange={(e) => setRestaurantFiles(e.target.files)}  // ✅
                  />
                  <p className="text-[10px] text-gray-400 mt-1">※ 업로드 후 대표 이미지를 선택하세요.</p>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center text-xs">
                      <input type="radio" name="mainImage" value="0" checked={mainImageIndex === 0} onChange={() => setMainImageIndex(0)} className="mr-1" /> 1번을 대표로
                    </label>
                    <label className="flex items-center text-xs">
                      <input type="radio" name="mainImage" value="1" checked={mainImageIndex === 1} onChange={() => setMainImageIndex(1)} className="mr-1" /> 2번을 대표로
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">메뉴 이미지</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm"
                    onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}  // ✅
                  />
                  <p className="text-[10px] text-gray-400 mt-1">※ 메뉴판 혹은 대표 메뉴 사진입니다.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={isRegModalOpen ? handleCreate : handleUpdate}  // ✅
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700"
                >
                  {isRegModalOpen ? '등록하기' : '수정완료'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold mb-2">매장 삭제 확인</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-bold text-gray-800">[{selectedItem?.restaurantName}]</span><br />
              정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setIsDelModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">취소</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg">삭제</button>  {/* ✅ */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurant;