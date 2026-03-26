import { useEffect, useState } from 'react';
import { Book } from '../types';

/**
 * 훅스 이름: useBooks
 * 목적: React의 커스텀 훅(use...)으로, 모든 책 데이터를 한 곳에서 관리하는 중심 로직입니다.
 * 만약 이 프로그램을 처음부터 만든다면, 컴포넌트들끼리 상태를 공유하기 위해 이 파일처럼 상태 관리 로직(CRUD)을 분리해야 합니다.
 * 로컬 스토리지(브라우저 저장소)를 데이터베이스처럼 활용하여 새로고침해도 데이터가 유지되도록 구현되었습니다.
 */
export function useBooks() {
  // books: 컴포넌트 화면을 그릴 때 기준이 되는 책 목록 데이터(배열)입니다.
  // 이 상태가 변경(setBooks)될 때마다, 이 훅을 사용하는 UI 역시 실시간으로 업데이트(리렌더링)됩니다.
  const [books, setBooks] = useState<Book[]>([]);//generic type

  // isLoaded: 로컬 저장소에서 데이터를 성공적으로 불러왔는지 여부를 판단하는 상태입니다.
  // 이 값이 true가 되기 전에는 화면을 그리지 않거나 로딩 인디케이터를 띄워야 오류를 방지할 수 있습니다.
  const [isLoaded, setIsLoaded] = useState(false);

  // useEffect: 컴포넌트가 처음 화면에 나타날 때(마운트) 딱 한 번만 실행되는 초기화 로직입니다.
  // 저장된 데이터가 있으면 불러오고, 없으면 연습용(더미) 데이터를 생성해 저장합니다.
  useEffect(() => {//[]: 의존성 배열, 빈 배열이면 마운트 시 딱 한 번만 실행됨
    // 브라우저의 로컬 저장소에서 'book-manager-data'라는 키로 저장된 문자열 데이터를 찾아옵니다.
    const stored = localStorage.getItem('book-manager-data');
    if (stored) {
      // 기존에 저장된 데이터가 있다면(재방문자)
      try {
        // 문자열을 다시 원래의 배열 객체 형태로 변환하여 상태(books)로 만듭니다.
        setBooks(JSON.parse(stored));
      } catch (e) {
        // JSON 파싱 중 오류가 났을 때 빈 화면이 뜨는 것을 막기 위한 오류 처리입니다.
        console.error("Failed to parse books", e);
      }
    } else {
      // 만약 데이터가 전혀 없다면(처음 접속한 사람), 화면이 비어있으면 심심하므로 연습용 데이터(dummyBooks)를 제공합니다.
      const dummyBooks: Book[] = [
      {
        id: '1',
        title: '위대한 개츠비',
        author: 'F. 스콧 피츠제럴드',
        // 프로그램 전체 구조상 이미지 URL을 외부 링크로 처리합니다. 
        coverUrl: 'https://picsum.photos/seed/gatsby/400/600',
        status: 'completed',
        rating: 5,
        addedAt: Date.now() - 10000000,
        totalPages: 300
      },
      {
        id: '2',
        title: '사피엔스',
        author: '유발 하라리',
        coverUrl: 'https://picsum.photos/seed/sapiens/400/600',
        status: 'reading',
        rating: 0,
        addedAt: Date.now() - 5000000,
        totalPages: 300
      },
      {
        id: '3',
        title: '클린 코드',
        author: '로버트 C. 마틴',
        coverUrl: 'https://picsum.photos/seed/cleancode/400/600',
        status: 'to-read',
        rating: 0,
        addedAt: Date.now(),
        totalPages: 300
      },
    ]
    // 방금 생성한 더미 데이터를 React 상태에 지정합니다 (이 순간 화면에 나타나게 됨).
    setBooks(dummyBooks);
    // 나중에 다시 접속할 때를 위해 로컬 스토리지에 문자열 포맷으로 변환해 저장해둡니다.
    localStorage.setItem('book-manager-data', JSON.stringify(dummyBooks));
  }
    // 초기 로딩 로직이 무사히 끝났음을 표시해줍니다.
    setIsLoaded(true);
  }, []);

  /**
 * 저장 헬퍼 함수: 상태 변경(setBooks)과 브라우저 저장(localStorage)을 동시에 수행합니다.
 * 이렇게 묶어두면 데이터를 수정할 때마다 매번 로컬 스토리지를 업데이트하는 코드 중복을 막을 수 있습니다.
 */
const saveBooks = (newBooks: Book[]) => {
  setBooks(newBooks);
  localStorage.setItem('book-manager-data', JSON.stringify(newBooks));
};

/**
 * CREATE(추가): 새 책을 목록에 더합니다.
 * id와 addedAt(시간)은 시스템에서 자동으로 생성하므로 Omit 타입으로 제외하고 외부에서 받습니다.
 */
const addBook = (book: Omit<Book, 'id' | 'addedAt'>) => {
  // 💡 디버깅 용도: 저장 직전에 ...book 보따리 안에 정확히 어떤 데이터가 들어오는지 브라우저 개발자 도구의 콘솔(Console)창에 출력해 봅니다.
  console.log("🔍 [디버깅] 보따리를 풀기 전 book 객체의 내부 모습:", book);

  // crypto.randomUUID()를 통해 책마다 고유한 아이디를 발급하여 중복이나 에러가 없도록 합니다.
  const newBook: Book = { ...book, id: crypto.randomUUID(), addedAt: Date.now() };//spread 연산자
  // 새로 만든 책을 맨 앞에 두고 기존 목록(...books)을 뒤에 붙여 최신 항목이 상단에 오게 만듭니다.
  saveBooks([newBook, ...books]);
};

/**
 * UPDATE(수정): 특정 ID를 가진 책의 정보를 업데이트합니다.
 * Partial<Book>은 북 객체의 일부 속성만 넘겨도 수정할 수 있게 해주는 유용한 타입입니다.
 */
const updateBook = (id: string, updates: Partial<Book>) => {
  // 모든 책을 순회하며(.map), 수정하려는 id와 일치하는 책을 찾으면(b.id === id) 기존 데이터(b) 위에 새 데이터(updates)를 덮어씌웁니다.
  saveBooks(books.map(b => b.id === id ? {
    ...b, ...updates
  } : b));
};

/**
 * DELETE(삭제): 특정 ID를 가진 책을 목록에서 지웁니다.
 */
const deleteBook = (id: string) => {
  // 삭제하려는 id와 같지 않은 책들만 필터링하여 남기면 곧 삭제 효과가 발생합니다.
  saveBooks(books.filter(b => b.id !== id));
};

// UI 컴포넌트(App.tsx 등)에서 이 훅을 호출하면 아래의 변수와 함수들을 가져다 쓸 수 있습니다.
return { books, isLoaded, addBook, updateBook, deleteBook };
  }
