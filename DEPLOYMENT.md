# 🚀 Vercel 배포 가이드

## 방법 1: Vercel CLI로 배포

### 1단계: Vercel 계정 준비
- https://vercel.com 에서 계정 생성 (GitHub 계정으로 가입 권장)

### 2단계: 로그인
```bash
vercel login
```

### 3단계: 배포
```bash
vercel
```

프롬프트에서 다음을 선택:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **youtube-interview-formatter** (또는 원하는 이름)
- Directory? **./** (엔터)
- Override settings? **No**

### 4단계: 환경 변수 설정
배포 후 Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 추가:
   - Name: `OPENAI_API_KEY`
   - Value: `your_openai_api_key`
   - Environment: Production, Preview, Development 모두 선택

### 5단계: 재배포
```bash
vercel --prod
```

---

## 방법 2: Vercel GitHub 연동 (권장)

### 1단계: GitHub에 푸시
```bash
git push origin claude/youtube-subtitle-interview-formatter-011CUr2DYasfgmQqx9HczvgT
```

### 2단계: Vercel 설정
1. https://vercel.com 로그인
2. **Add New** → **Project** 클릭
3. GitHub 저장소 연동
4. `OneLook` 저장소 선택
5. **Import** 클릭

### 3단계: 환경 변수 설정
배포 전 화면에서:
1. **Environment Variables** 섹션에서 추가
2. Name: `OPENAI_API_KEY`
3. Value: OpenAI API 키 입력
4. **Deploy** 클릭

### 4단계: 자동 배포 완료
- 배포가 완료되면 URL이 제공됩니다
- 이후 GitHub에 푸시할 때마다 자동으로 배포됩니다!

---

## 배포 후 확인사항

✅ 배포 URL 접속 확인
✅ YouTube URL 입력 테스트
✅ 자막 추출 기능 확인
✅ AI 인터뷰 정리 기능 확인

## 도메인 연결 (선택사항)

Vercel 대시보드에서:
1. 프로젝트 → Settings → Domains
2. 원하는 도메인 입력 후 설정

---

## 문제 해결

### 빌드 오류
- Logs 탭에서 오류 확인
- 환경 변수가 올바르게 설정되었는지 확인

### API 오류
- OpenAI API 키가 올바른지 확인
- API 키에 크레딧이 있는지 확인

### 자막 추출 실패
- 유튜브 영상에 자막이 있는지 확인
- 한국어 또는 영어 자막이 있는지 확인
