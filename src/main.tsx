import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // 우리가 작성한 메인 앱 컴포넌트
import './index.css'; // 테일윈드 CSS와 기본 스타일 지정 파일 설정

/**
 * 이 파일은 리액트 프로그램의 "진입점(Entry Point)" 입니다.
 * index.html 파일의 <div id="root"></div> 안에, 우리의 리액트 앱(<App />)을 렌더링(부착)하는 역할을 합니다.
 */
createRoot(document.getElementById('root')!).render(
  // StrictMode는 개발 중에만 2번씩 렌더링을 발생시켜서 잠재적인 버그(예상치 못한 부작용)를 잡아주는 검사기 역할을 합니다.
  <StrictMode>
    {/* 앱의 전체 구조가 담긴 중심 컴포넌트 */}
    <App />
  </StrictMode>,
);

