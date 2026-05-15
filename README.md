# tellmewhat

> 권한을 누르기 전, 브라우저가 이미 말해버린 것들.

`tellmewhat`은 브라우저가 별도 권한 요청 없이 제공하는 신호들을 모아
짧은 내러티브로 보여주는 웹 프라이버시 실험입니다.

**Demo:** https://suchlikesamsung.github.io/tellmewhat/

접속하면 페이지는 먼저 사용자의 언어와 색상 모드 선호를 읽고, 그에 맞춰
문장을 바꾸고 테마를 준비합니다. 그 다음 IP 기반 위치 추정, 화면, 언어,
시간대, 기기 힌트, WebGL, 폰트, 캔버스 해시를 천천히 펼쳐 보여줍니다.

**A tiny browser privacy experiment that shows what your browser says before you click Allow.**

## Features

- 한국어/영어/일본어 글자가 섞이는 인트로 스크램블 효과
- 브라우저 언어 기반 한국어/영어 자동 전환
- 다크모드/라이트 모드 선호 감지와 테마 전환
- 권한 요청 없이 읽을 수 있는 브라우저 신호 표시
- IP 기반 대략 위치 추정
- WebGL GPU 힌트, 폰트 추정, 캔버스 렌더링 해시
- 같은 브라우저 신호로 생성되는 간단한 바코드 형태의 fingerprint
- 정적 HTML/CSS/JS만으로 동작

## 실행

`index.html`을 브라우저에서 열면 바로 실행됩니다.

또는 로컬 서버로 실행할 수 있습니다.

```bash
node server.mjs
```

실행 후 브라우저에서 아래 주소를 열면 됩니다.

```text
http://127.0.0.1:4173/
```

## What It Reads

이 페이지는 다음과 같은 브라우저 신호를 사용합니다.

- `navigator.language`, `navigator.languages`
- `prefers-color-scheme`
- User-Agent와 플랫폼 문자열
- 화면 크기, 뷰포트 크기, 픽셀 비율, 색상 깊이
- CPU 코어 수와 메모리 근사치
- 네트워크 상태 힌트
- WebGL 렌더러와 벤더 힌트
- 캔버스 렌더링 결과 해시
- 글자 폭 측정 기반 폰트 추정
- IP 기반 대략 위치 조회

## What It Does Not Read

이 페이지는 아래 정보에 접근하지 않습니다.

- 정확한 GPS 위치
- 카메라
- 마이크
- 클립보드 내용
- 로컬 파일
- 브라우저 저장소에 남는 추적용 ID

## Notes

IP 기반 위치는 정확한 위치가 아니라 네트워크 기반 추정입니다. VPN, 프록시,
모바일 네트워크, ISP 정책에 따라 실제 위치와 다르게 보일 수 있습니다.

폰트와 캔버스 정보도 파일 목록을 읽는 것이 아니라 브라우저 렌더링 차이를
측정해 추정합니다.

## Deploy

정적 파일만으로 동작하므로 GitHub Pages, Netlify, Vercel 같은 정적 호스팅에
그대로 올릴 수 있습니다.
