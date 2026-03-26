/**
 * 파일 목적: 애플리케이션 전체에서 재사용되는 핵심 데이터 타입(인터페이스)들을 정의하는 파일입니다.
 * 이 구조를 알면 북매니저 프로그램이 어떤 데이터를 다루는지 파악할 수 있습니다.
 */

// 책의 현재 읽기 상태를 나타내는 유니온 타입입니다.
// - 'to-read': 읽을 예정인 책
// - 'reading': 현재 읽고 있는 책
// - 'completed': 다 읽은 책
export type BookStatus = 'to-read' | 'reading' | 'completed' | 'dropped'; //union type

// 하나의 단일 책 데이터를 표현하는 구조 설계(인터페이스)입니다.
// 프로그램 내의 모든 책 데이터는 반드시 이 구조를 따라야 합니다.
export interface Book {
  // 책의 고유 식별자 문자열 (삭제/수정 시 이 id를 기준으로 찾습니다)
  id: string;

  // 책의 제목 문자열
  title: string;

  // 책의 저자 이름 문자열
  author: string;

  // 표지 이미지의 외부 URL (이미지 주소가 없을 때를 대비한 처리 로직도 화면 UI에 필요함)
  coverUrl: string;

  // 현재 책의 읽기 상태 (위에서 정의한 BookStatus 타입 사용)
  status: BookStatus;

  // 사용자가 책에 준 평점 (숫자, 0~5 범위). 상태가 'completed'일 때 주로 활용됩니다.
  rating: number; // 0-5

  // 책 정보가 데이터베이스(또는 저장소)에 등록된 타임스탬프 시간.
  // 이 값을 기준으로 새로 추가된 순서대로 정렬 등을 할 수 있습니다.
  addedAt: number;

  // 새로 추가된 속성: 책의 전체 페이지 수 (숫자)
  totalPages?: number;
}
