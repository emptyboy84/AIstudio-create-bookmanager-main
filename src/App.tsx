import { BookMarked, BookOpen, CheckCircle, Clock, Edit, Library, Plus, Search, Star, Trash2 } from 'lucide-react'; // 아이콘들
import { AnimatePresence, motion } from 'motion/react'; // 애니메이션 효과를 주기 위한 라이브러리
import React, { useMemo, useState } from 'react';
import { BookModal } from './components/BookModal'; // 책 추가/수정을 담당하는 팝업 컴포넌트 불러오기
import { useBooks } from './hooks/useBooks'; // 데이터 로직이 분리된 커스텀 훅 불러오기
import { Book, BookStatus } from './types'; // 타입스크립트 기반 데이터 구조 불러오기

/**
 * 기본 메인 컴포넌트: 전체 북매니저 프로그램의 뼈대가 되는 중심 조립 창구입니다.
 * 이곳에서 화면의 헤더, 통계 패널, 검색창, 그리고 책 카드 목록들을 조립하여 사용자에게 보여줍니다.
 */
export default function App() {
  // 1. 커스텀 훅(useBooks)에서 데이터 상태와 CRUD 함수들을 가져옵니다.
  const { books, isLoaded, addBook, updateBook, deleteBook } = useBooks();

  // 2. 검색창에 입력한 글자를 일시적으로 저장해둘 공간(State)
  const [searchQuery, setSearchQuery] = useState('');

  // 3. '전체', '읽을 예정', '읽는 중', '완료' 탭 중 어떤 탭이 선택되어 있는지 저장하는 공간
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');

  // 4. 모달 팝업창을 지금 화면에 띄울지 말지를 결정하는 상태 변수 (true면 보이고 false면 숨김)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 5. 만약 사용자가 '수정' 버튼을 눌렀다면, 어떤 책을 수정할 것인지 정보를 담아두는 공간
  // null이면 '새로 추가하기' 모드라는 뜻으로 쓰입니다.
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  /**
   * useMemo 훅: 데이터를 화면에 그릴 때 불필요한 재계산을 방지하는 역할입니다.
   * `books` 배열 내용이 변경될 때만 다시 계산하여 통계 수치(전체 도서 수, 상태별 도서 수 등)를 뽑아냅니다.
   */
  const stats = useMemo(() => {
    return {
      total: books.length,
      toRead: books.filter(b => b.status === 'to-read').length, // '읽을 예정'인 책만 필터링한 개수
      reading: books.filter(b => b.status === 'reading').length, // '읽는 중'인 책만 필터링한 개수
      completed: books.filter(b => b.status === 'completed').length, // '완료'된 책만 필터링한 개수
    };
  }, [books]); // 의존성 배열: books가 바뀔 때만 이 함수가 다시 실행됨

  /**
   * 필터링된 도서 목록을 계산하는 변수입니다.
   * 사용자가 입력한 [검색어(searchQuery)]와 선택한 [탭(filterStatus)] 조건을 모두 통과한 책만 남깁니다.
   */
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // 제목이나 저자 이름 중 검색어가 포함되어 있는지 확인 (대소문자 구분을 없애기 위해 toLowerCase()로 통일)
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      // 현재 선택된 탭이 'all(전체)'이거나, 아니면 책의 상태가 선택된 탭과 동일한지 확인
      const matchesStatus = filterStatus === 'all' || book.status === filterStatus;

      // 검색어와 상태 조건 둘 다 만족해야 진짜로 화면에 보여줄 목록으로 채택됨
      return matchesSearch && matchesStatus;
    });
  }, [books, searchQuery, filterStatus]);

  /** [핸들러] 헤더의 '새 책 추가' 버튼을 눌렀을 때 실행되는 함수 */
  const handleAddClick = () => {
    setEditingBook(null); // 수정할 책이 없음을 명시함 (새로 추가 모드라는 뜻)
    setIsModalOpen(true); // 모달 창 열기
  };

  /** [핸들러] 책 카드에 있는 '수정(연필)' 아이콘을 눌렀을 때 실행되는 함수 */
  const handleEditClick = (book: Book) => {
    // 해당 책의 데이터를 editingBook 상태에 넣어서 모달창으로 넘겨줌으로써 기존 정보를 불러오게 함
    setEditingBook(book);
    setIsModalOpen(true); // 모달 창 열기
  };

  /** [핸들러] 모달 창 안에서 완료(저장 또는 추가) 버튼을 눌렀을 때 실행되는 통합 저장 함수 */
  const handleSaveBook = (bookData: Omit<Book, 'id' | 'addedAt'>) => {
    if (editingBook) {
      // 기존 책을 수정하는 모드였다면 updateBook 함수 호출
      updateBook(editingBook.id, bookData);
    } else {
      // 아예 새로운 책을 추가하는 모드였다면 addBook 함수 호출
      addBook(bookData);
    }
  };

  // 만약 useBooks에서 브라우저 로컬 저장소를 읽는 로직이 안 끝났다면 빈 화면 렌더링(에러 방지)
  if (!isLoaded) return null;

  return (
    // 전체 배경 화면 (Tailwind CSS를 사용하여 그라데이션 및 디자인 적용)
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      {/* -------------------- [1] 헤더(상단 내비게이션바) -------------------- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* 타이틀 로고 영역 */}
          <div className="flex items-center gap-2 text-blue-600">
            <BookMarked size={28} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">북매니저</h1>
          </div>
          {/* 우측 새 책 추가 버튼 (이 버튼을 누르면 handleAddClick 호출됨) */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-sm shadow-blue-600/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">새 책 추가</span>
          </button>
        </div>
      </header>

      {/* -------------------- [2] 메인 콘텐츠 영역 -------------------- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 통계 대시보드 (위에서 계산해 둔 stats 변수를 화면에 그려주는 부분) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* StatCard 컴포넌트를 사용해 각 상태별 개수를 요약 카드 형태로 보여줌 */}
          <StatCard icon={<Library className="text-blue-500" />} label="전체 도서" value={stats.total} />
          <StatCard icon={<Clock className="text-amber-500" />} label="읽을 예정" value={stats.toRead} />
          <StatCard icon={<BookOpen className="text-indigo-500" />} label="읽는 중" value={stats.reading} />
          <StatCard icon={<CheckCircle className="text-emerald-500" />} label="읽기 완료" value={stats.completed} />
        </section>

        {/* 컨트롤(조작) 영역: 검색 바 및 필터(필터링 탭) 버튼들 */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

          {/* 검색창 */}
          <div className="relative w-full sm:max-w-xs">
            {/* 인풋 입력창 안에 돋보기 아이콘을 올려놓기 위한 절대위치 css 처리 */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="제목이나 저자로 검색..."
              value={searchQuery} // 인풋창에 입력된 글자는 무조건 상태 변수 searchQuery를 따름
              onChange={(e) => setSearchQuery(e.target.value)} // 글자를 타이핑할때마다 상태가 실시간 변화됨
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* 필터 카테고리 (전체, 읽을 예정 등을 필터링 선택) */}
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {/* FilterButton 컴포넌트는 active 여부에 따라 색상이 짙어집니다. */}
            <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>전체</FilterButton>
            <FilterButton active={filterStatus === 'to-read'} onClick={() => setFilterStatus('to-read')}>읽을 예정</FilterButton>
            <FilterButton active={filterStatus === 'reading'} onClick={() => setFilterStatus('reading')}>읽는 중</FilterButton>
            <FilterButton active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')}>완료</FilterButton>
          </div>
        </section>

        {/* -------------------- [3] 도서 그리드 (실제 책 카드들이 나열되는 핵심 UI) -------------------- */}
        <section>
          {filteredBooks.length === 0 ? (
            // 만약 검색결과가 통과한 책이 단 하나도 없다면 뜨는 에러 처리(빈 화면)
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">책이 없습니다</h3>
              <p className="text-gray-500 mt-1">새로운 책을 추가하거나 검색 조건을 변경해보세요.</p>
            </div>
          ) : (
            // 책이 1개라도 있다면 책의 갯수만큼 BookCard 컴포넌트를 찍어냄
            // motion.div는 스르륵 나타나거나 움직이는 애니메이션 효과를 부여하기 위함입니다.
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {/* 필터링된 배열을 순회(.map)하며 BookCard 조각 화면에 데이터를 주입하여 만들어냅니다. */}
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.id} // 리액트 반복문에서는 항상 구분을 위한 고유 key가 필수입니다.
                    book={book}
                    onEdit={() => handleEditClick(book)}
                    onDelete={() => deleteBook(book.id)} // 해당 책 삭제
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* 
        팝업 모달창 컴포넌트는 백그라운드에 늘 배치해두되 
        설정된 상태값(isOpen)에 따라 화면에 보이거나 가려집니다. 
      */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBook}
        initialData={editingBook}
      />
    </div>
  );
}

/** 
 * 자식(보조) 컴포넌트: 통계 수치를 보여주는 사각형 카드. 
 * 코드를 분리해서 메인 App 함수가 뚱뚱해지는 걸 막아줍니다.
 */
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/** 
 * 자식(보조) 컴포넌트: 상태를 구별하기 위해 누르는 버튼 모양 컴포넌트입니다.
 * 눌렸을 때(active) 색상이 검은색으로 진해지도록 동적으로 CSS 클래스가 바뀝니다.
 */
function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active
        ? 'bg-gray-900 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {children}
    </button>
  );
}

/** 
 * 자식(보조) 컴포넌트: 개별 도서 항목 하나하나를 나타내는 네모난 카드입니다.
 * 메인 렌더링에 필요한 이미지, 로고, 삭제 등 모든 데이터를 받아와 여기서 그림으로 그립니다.
 */
function BookCard({ book, onEdit, onDelete }: { book: Book, onEdit: () => void, onDelete: () => void }) {
  // 실제 삭제 요청이 들어가기 전, '정말 삭제할거냐'고 한번 물어보는 모달을 띄우기 위한 관리 상태입니다.
  const [showConfirm, setShowConfirm] = useState(false);

  // 책의 상태 텍스트에 따라, 예쁜 라벨과 색상 테마를 자동으로 부여해주기 위해 매칭해둔 객체(Dictionary)입니다.
  const statusConfig = {
    'to-read': { label: '읽을 예정', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'reading': { label: '읽는 중', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    'completed': { label: '완료', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  // 현재 받아온 책 정보의 status를 토대로 알맞은 색과 라벨을 가져옵니다.
  const config = statusConfig[book.status];

  return (
    // framer-motion 라이브러리를 통해 이 카드가 생기고 사라질 때 애니메이션 부드러운 효과가 들어갑니다.
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }} // 처음엔 투명하고 약간 작게 시작
      animate={{ opacity: 1, scale: 1 }} // 원래 크기와 불투명도로 돌아옴
      exit={{ opacity: 0, scale: 0.9 }} // 삭제되어 나갈 때 다시 줄어들며 투명해짐
      whileHover={{ y: -4 }} // 마우스를 카드 위에 올리면 살짝 위로 떠오르는 효과
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all group flex flex-col relative"
    >
      {/* 썸네일(이미지) 박스 영역 */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {/* 만약 coverUrl 값이 있다면 img 태그를 활용해 외부 이미지를 로드합니다. */}
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            // 사용자가 입력한 URL이 잘못되었거나 깨졌을 경우 fallback으로 글자가 새겨진 랜덤 이미지를 띄웁니다.
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=random&size=400`;
            }}
          />
        ) : (
          // URL이 아예 없으면 기본 아이콘 플레이스홀더를 보여줍니다.
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookOpen size={48} className="text-gray-300" />
          </div>
        )}

        {/* Actions Overlay (이 부모 카드를 마우스로 가리켰을 때(hover)만 서서히 나타나는 수정/삭제 아이콘 버튼 영역) */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 rounded-full shadow-sm transition-colors">
            <Edit size={16} /> {/* 연필 모양 수정 아이콘 */}
          </button>
          <button onClick={() => setShowConfirm(true)} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 rounded-full shadow-sm transition-colors">
            <Trash2 size={16} /> {/* 쓰레기통 모양 삭제 아이콘 */}
          </button>
        </div>

        {/* 삭제 재차 확인용 오버레이: showConfirm 값이 켜졌을 때만 나타납니다. */}
        {showConfirm && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm font-medium text-gray-900 mb-3">정말 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">취소</button>
              {/* 여기에 있는 '삭제'를 눌러야 비로소 상단에서 넘겨받은 onDelete가 수행됩니다. */}
              <button onClick={onDelete} className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">삭제</button>
            </div>
          </div>
        )}
      </div>

      {/* 카드 하단부 텍스트 정보 영역 */}
      <div className="p-5 flex-1 flex flex-col">
        {/* 상단에 작게 표시되는 '읽는 중' '읽을 예정' 라벨 뱃지 */}
        <div className="mb-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* 책 제목 부분 (line-clamp-2 를 통해 두 줄이 넘어가면 말줄임표 ... 로 자릅니다) */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">{book.title}</h3>
        {/* 저자 부분. 회색빛으로 표시됩니다. */}
        <p className="text-sm text-gray-500 mb-4">{book.author}</p>

        {/* 카드의 최하단 부분 (별점 또는 책 추가 일자 노출) */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          {book.status === 'completed' ? (
            // 책 상태가 '완료'라면 부여받았던 별점을 보여줍니다 (예: 5/5)
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
              <span className="text-sm font-medium text-gray-700">{book.rating}/5</span>
            </div>
          ) : (
            // 다 읽지 않은 책이면 맨 처음 생성되었을 때 저장된 날짜를 사람 보기 좋은 문자열로 변환(toLocaleDateString)해서 출력합니다.
            <span className="text-xs text-gray-400">
              {new Date(book.addedAt).toLocaleDateString()} 추가됨
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
