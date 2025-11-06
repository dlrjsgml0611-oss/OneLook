# 🎥 YouTube Interview Formatter

AI 기자가 유튜브 인터뷰 자막을 인터뷰 형식으로 정리해주는 Next.js 애플리케이션입니다.

## 주요 기능

- 📺 유튜브 URL 입력
- 📝 자동 자막 추출 (한국어/영어 지원)
- 🤖 OpenAI GPT를 활용한 인터뷰 형식 정리
- 💎 깔끔한 Q&A 형식으로 변환
- 🎨 아름다운 UI/UX

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: CSS
- **APIs**:
  - `youtube-transcript`: 유튜브 자막 추출
  - `OpenAI GPT-4o-mini`: AI 기반 인터뷰 정리

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 OpenAI API 키를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
OPENAI_API_KEY=your_actual_openai_api_key
```

> OpenAI API 키는 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 사용 방법

1. 유튜브 URL 입력
   - 예: `https://www.youtube.com/watch?v=VIDEO_ID`
   - 또는: `https://youtu.be/VIDEO_ID`

2. "인터뷰 정리하기" 버튼 클릭

3. AI가 자막을 추출하고 인터뷰 형식으로 정리합니다

4. 정리된 결과를 확인하세요!

## 프로젝트 구조

```
.
├── app/
│   ├── api/
│   │   ├── extract-subtitles/   # 자막 추출 API
│   │   │   └── route.ts
│   │   └── format-interview/    # AI 인터뷰 정리 API
│   │       └── route.ts
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 레이아웃
│   └── page.tsx                 # 메인 페이지
├── .env.example                 # 환경 변수 예시
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 주의사항

- 자막이 있는 유튜브 동영상만 사용 가능합니다
- OpenAI API 사용에 따른 비용이 발생할 수 있습니다
- 긴 동영상의 경우 처리 시간이 다소 소요될 수 있습니다

## 라이선스

MIT

## 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!
