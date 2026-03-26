import { Star, X } from 'lucide-react'; // 아이콘 라이브러리 (닫기, 별 모양 아이콘 등)
import React, { useEffect, useState } from 'react';
import { Book, BookStatus } from '../types'; // 데이터 타입 임포트

/**
 * 컴포넌트 설명: 책을 추가하거나 수정할 때 나타나는 "모달 판(팝업)" 컴포넌트입니다.
 * 
 * [Props 구조 설명]
 * - isOpen: 모달이 화면에 보여야 하는지 여부(true/false)
 * - onClose: 닫기 버튼을 누르거나 백그라운드 클릭 시 모달을 닫는 함수
 * - onSave: 사용자가 '추가'나 '저장' 버튼을 눌렀을 때 입력한 폼 데이터를 바깥(App.tsx 등)으로 전달하는 함수
 * - initialData: 만약 '수정'을 위해 열렸다면, 수정할 책의 기존 데이터. '새로 추가'일 경우 이 값은 null이 거나 undefined입니다.
 */

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;//모달 닫기
  // id와 addedAt은 여기서 만들 수 없으므로(저장될 때 시스템이 배정) Omit으로 삭제한 타입을 반환합니다.
  onSave: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  initialData?: Book | null;//수정할 책의 기존 데이터
}

export function BookModal({ isOpen, onClose, onSave, initialData }: BookModalProps) {
  // 폼(Form)에서 사용자가 입력하는 각각의 항목(입력칸)을 위한 상태들(States)입니다.
  // 사용자가 키보드로 타이핑을 하거나 드롭다운을 변경할 때마다 이 상태들이 실시간으로 변경됩니다.
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState<BookStatus>('to-read');
  const [rating, setRating] = useState(0);
  const [totalPages, setTotalPages] = useState(0);//전체 페이지 수
  /**
   * useEffect의 역할: 모달이 열릴 때(isOpen)나 넘겨받은 초기 데이터(initialData)가 바뀔 때 실행됩니다.
   * 수정하기 버튼을 눌러 모달을 띄우면 기존 책 정보가 입력칸에 미리 채워져 있어야 하기 때문에 이 로직이 필수적입니다.
   */
  useEffect(() => {//useEffect는 단지 로컬 스토리지에서 데이터를 처음 "가
    // 져오는" 1회성 작업일 뿐, 뒤에서 계속 돌아가는 타이머나 연결을 만들어두진 않았습니
    // 다. 잠그고 갈 수도꼭지가 없기 때문에 굳이 소멸자(return)를 작성하지 않은 것입니다!
    if (initialData) {
      // 기존 데이터가 있다면(수정 모드), 폼의 상태들을 기존 데이터로 채웁니다.
      setTitle(initialData.title);
      setAuthor(initialData.author);
      // 빈 문자열 방어 코드 (coverUrl이 undefined일 수 있으므로 || '' 처리)
      setCoverUrl(initialData.coverUrl || '');
      setStatus(initialData.status);
      setRating(initialData.rating || 0);
    } else {
      // 신규 추가 모드인 경우, 이전 입력값이 남아있을 수 있으므로 모든 입력칸을 텅 비우거나 기본값으로 되돌립니다(초기화 단계)
      setTitle('');
      setAuthor('');
      setCoverUrl('');
      setStatus('to-read');
      setRating(0);
    }
  }, [initialData, isOpen]);

  // isOpen이 false이면 모달 UI 조각이 아예 렌더링(생성)되지 않도록 막아버립니다. (화면에서 보이지 않음)
  if (!isOpen) return null;

  /**
   * 핸들러 폼 이벤트 (저장 버튼 클릭 시 실행됨)
   */
  const handleSubmit = (e: React.FormEvent) => {
    // 폼 전송 시 브라우저가 화면을 새로고침하는 기본 성질을 막아줍니다. SPA(단일 페이지 애플리케이션)에서는 필수입니다.
    e.preventDefault();

    // 부모 컴포넌트(App.tsx)에서 넘겨받은 onSave 함수를 호출해, 지금까지 입력된 새로운 상태값들을 묶어서 전달합니다.
    onSave({ title, author, coverUrl, status, rating, totalPages });

    // 처리가 끝났으니 모달 창을 닫습니다.
    onClose();
  };

  return (//destructuring
    // 배경을 반투명하게 하고 화면 중앙에 모달을 배치하기 위한 CSS 클래스(TailwindCSS)입니다.
    // fixed, inset-0 등은 화면 전체를 덮게 만들고 z-50은 다른 요소보다 무조건 위로 뜨게 합니다.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* 흰색 모달 박스 몸체 부분 */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* 모달 박스의 헤더 (제목과 닫기 버튼) */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            {/* initialData가 있는지(수정모드) 없는지(신규추가)에 따라 화면의 제목(타이틀)이 다르게 렌더링됩니다. */}
            {initialData ? '책 수정하기' : '새로운 책 추가'}
          </h2>
          {/* 닫기 (X 아이콘) 버튼 */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 실제 데이터를 입력받는 폼입니다. 폼이 통과(submit) 될 때 위의 handleSubmit 함수가 실행됩니다. */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* 책 제목 입력칸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            {/* value={title}로 데이터 묶음이 처리되어있고 handleChange(onChange)로 타이핑시마다 최신화됩니다. required 태그를 빼먹지 않게 설정합니다.*/}
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="책 제목을 입력하세요" />
          </div>

          {/* 책 저자 입력칸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">저자</label>
            <input required type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="저자 이름을 입력하세요" />
          </div>

          {/* 표지 이미지 URL 입력칸 (선택사항이므로 required 없음) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">표지 이미지 URL (선택)</label>
            <input type="url" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="https://..." />
          </div>

          {/* 전체 페이지 수 입력칸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전체 페이지 수</label>
            <input type="number" value={totalPages} onChange={e => setTotalPages(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="전체 페이지 수를 입력하세요" />
          </div>

          {/* 책의 현재 상태를 고르는 드롭다운 메뉴(select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select value={status} onChange={e => setStatus(e.target.value as BookStatus)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white">
              <option value="to-read">읽을 예정</option>
              <option value="reading">읽는 중</option>
              <option value="completed">읽기 완료</option>
              <option value="dropped">읽기 포기</option>
            </select>
          </div>

          {/* 조건부 렌더링 패턴: 상태가 'completed(완료)'일 때만 별점 입력 UI가 화면에 나타납니다. */}
          {status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
              <div className="flex gap-1">
                {/* 1부터 5까지 반복문을 돌려 별점 아이콘 버튼을 각각 5개 랜더링합니다. */}
                {[1, 2, 3, 4, 5].map(star => (
                  // 사용자가 클릭한 별점 위치에 맞춰 상태값(rating)이 1,2,3,4,5로 변경됩니다.
                  <button type="button" key={star} onClick={() => setRating(star)} className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>
                    {/* 선택된 별점보다 작은 번호의 별들은 불이 켜지고, 나머지는 꺼지는 CSS 처리 로직입니다. */}
                    <Star size={28} fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 취소/확인(저장) 버튼 영역 */}
          <div className="pt-4 flex justify-end gap-3">
            {/* type="button"으로 두어야 submit이 일어나지 않고 취소 로직만 작동합니다. */}
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
              취소
            </button>
            {/* type="submit"인 버튼을 누르면 이 form의 제일 위쪽에 있는 onSubmit 핸들러가 가동됩니다. */}
            <button type="submit" className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20">
              {/* 수정된 항목이면 버튼 이름이 '저장', 새로 만든 책이면 '추가'라고 표기합니다 */}
              {initialData ? '저장' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
