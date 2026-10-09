# 🚀 bluiaflow.github.io - GitHub Pages 배포 가이드

본 애플리케이션은 GitHub Pages 유저 메인 사이트(`https://bluiaflow.github.io`) 및 일반 서브경로 환경 모두에서 100% 원활하게 작동하도록 설계되었습니다.

---

## 🛠️ 핵심 준비 사항 (이미 완료됨)

1. **상대 경로 Base 설정 (`vite.config.ts`)**:
   - `base: './'` 가 설정되어 있어 루트 도메인(`https://bluiaflow.github.io/`) 및 서브 경로 모두에서 JS/CSS 번들 파일이 완벽하게 로드됩니다.
2. **GitHub Actions 배포 워크플로우 (`.github/workflows/deploy.yml`)**:
   - 코드가 `main` 브랜치에 푸시되면 GitHub Actions가 자동으로 프로젝트를 빌드하고 GitHub Pages로 배포합니다.
3. **클라이언트 측 데이터 영속성 & Supabase 연동**:
   - `localStorage` 및 Supabase 실시간 연동, 하트비트(Heartbeat) 기능이 탑재되어 있습니다.

---

## 📌 GitHub Pages 활성화 단계

1. **AI Studio에서 GitHub 푸시**:
   - 저장소 이름: **`bluiaflow.github.io`**
   - 브랜치: **`main`**
   - 커밋 메시지 입력 후 푸시

2. **GitHub 저장소 웹사이트에서 Pages 설정**:
   - `https://github.com/bluiaflow/bluiaflow.github.io` (또는 해당 계정 저장소) 접속
   - **Settings** 탭 > 좌측 메뉴 **Pages** 클릭
   - **Build and deployment** 섹션의 **Source**를 **"GitHub Actions"** 로 선택
   *(만약 기본값으로 GitHub Actions가 선택되어 있다면 그대로 두시면 됩니다)*

3. **자동 배포 확인**:
   - 상단 **Actions** 탭에서 **Deploy to GitHub Pages** 워크플로우가 초록색 체크(`✔`)로 완료되면,
   - **`https://bluiaflow.github.io`** 주소로 즉시 접속하실 수 있습니다.

---

## 📌 방법 2: `gh-pages` 패키지를 통한 터미널 수동 배포

GitHub Actions 대신 터미널에서 직접 빌드 결과물을 `gh-pages` 브랜치로 올리고자 할 때 사용합니다:

1. `gh-pages` 패키지 설치:
   ```bash
   npm install --save-dev gh-pages
   ```

2. `package.json` 파일의 `"scripts"` 섹션에 명령어 추가:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. 배포 실행:
   ```bash
   npm run deploy
   ```

4. GitHub 저장소의 **Settings** > **Pages** 에서 **Source**를 **"Deploy from a branch"**, Branch를 **"gh-pages / (root)"** 로 설정하고 저장합니다.

---

## 💡 유의 사항 및 팁

- **다크 모드 & 고대비**: 사용자 브라우저 기본 테마를 자동 감지하며, 상단 토글로 언제든 변경할 수 있습니다.
- **데이터 백업**: 브라우저 캐시를 지우기 전에 상단 우측의 백업 버튼(아이콘)을 눌러 JSON 파일을 다운로드해 두면 언제든 1초 만에 복원할 수 있습니다.
