# 음악 플레이리스트 플레이어

GitHub Pages를 통해 호스팅되는 음악 플레이리스트 웹 애플리케이션입니다. 유튜브 링크를 사용하여 음악을 재생하고 플레이리스트를 관리할 수 있습니다.

## 기능

- 여러 플레이리스트 관리
- 유튜브 링크를 통한 음악 재생
- 노래 제목, 아티스트, 가사 표시
- 재생 컨트롤 (재생, 일시정지, 이전 곡, 다음 곡)
- 모바일 반응형 디자인
- 따뜻하고 사랑스러운 디자인 테마

## 사용 방법

### 플레이리스트 추가 및 편집

`playlists.json` 파일을 편집하여 플레이리스트와 노래를 추가하거나 수정할 수 있습니다. 각 플레이리스트 객체는 다음과 같은 구조를 가집니다:

```json
{
  "id": "unique_playlist_id",
  "title": "플레이리스트 제목",
  "coverUrl": "플레이리스트 커버 이미지 URL",
  "songs": [
    {
      "title": "노래 제목",
      "artist": "아티스트 이름",
      "url": "유튜브 동영상 URL",
      "duration": 노래 길이(초),
      "coverUrl": "노래 커버 이미지 URL (없으면 플레이리스트 커버 사용)",
      "lyrics": "노래 가사 (줄바꿈은 \\n으로 표시)"
    },
    // 더 많은 노래...
  ]
}
```

커버 이미지가 없는 경우 `default-cover.jpg`가 사용됩니다.

### GitHub Pages에 배포하는 방법

1. 저장소를 GitHub에 푸시합니다.
2. GitHub 저장소 설정에서 Pages 탭으로 이동합니다.
3. Source 섹션에서 배포할 브랜치(보통 main 또는 master)를 선택합니다.
4. 저장을 클릭하면 몇 분 후에 사이트가 배포됩니다.

GitHub Pages URL은 일반적으로 `https://[사용자명].github.io/[저장소명]` 형식입니다.

### Vercel에 배포하는 방법

1. Vercel 계정에 로그인합니다.
2. "New Project" 버튼을 클릭합니다.
3. GitHub 저장소를 연결하고 저장소를 선택합니다.
4. 필요한 경우 빌드 설정을 구성합니다 (이 프로젝트는 정적 사이트이므로 기본 설정으로도 충분합니다).
5. "Deploy" 버튼을 클릭합니다.

## 프로젝트 구조

- `index.html`: 메인 HTML 파일
- `styles.css`: CSS 스타일시트
- `app.js`: JavaScript 애플리케이션 로직
- `playlists.json`: 플레이리스트 및 노래 데이터
- `default-cover.jpg`: 기본 커버 이미지

## 로컬에서 실행하기

이 프로젝트는 정적 웹사이트이므로 간단히 파일을 열거나 로컬 서버로 실행할 수 있습니다:

1. 저장소를 클론하거나 다운로드합니다.
2. 로컬 웹 서버를 사용하여 실행합니다. 예를 들어:
   - Python: `python -m http.server`
   - Node.js: `npx serve`
3. 브라우저에서 `http://localhost:8000`(또는 서버가 알려주는 URL)에 접속합니다.

## 제한 사항

- 이 플레이어는 YouTube 영상의 공유 URL을 사용하지만, 공식 YouTube API를 완전히 통합하지는 않습니다. 실제 운영 환경에서는 YouTube API를 사용하려면 Google 개발자 계정과 API 키가 필요합니다.
- 사용하는 YouTube 링크의 저작권 문제에 주의하세요.
- 음악 정보(썸네일, 제목, 아티스트)가 플레이리스트 JSON 파일에서 정의됩니다. 실제 YouTube 메타데이터를 자동으로 가져오려면 YouTube API를 추가로 구현해야 합니다. 