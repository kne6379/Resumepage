# Resumepage

## Node.js 숙련주차
- 백엔드 서버를 구성하기 위하여 mysql을 통한 데이터베이스 설계, 구현   
- 사용자 CRUD + 이력서 CRUD 및 jwt 토큰을 사용한 사용자 인증과 권한 인가   
- 에러 처리 미들웨어
- 인증 미들웨어
- 인가 미들웨어
- 리프레쉬 토큰 검증 미들웨어
- Joi를 이용한 유효성 검증 미들웨어 

## 실행 방법
1. .env 파일을 생성하여, 환경변수를 추가한다.   
2. yarn 명령으로 프로젝트에 필요한 패키지를 설치한다.   
3. yarn start명령으로 서버를 실행한다. (개발 시에는 yarn dev)   

## 환경변수   
- DATABASE_URL : RDS와 연결된 mySQL URL
- SERVER_PORT : 사용할 서버 포트
- ACCESS_SECRET_KEY : 액세스 토큰에 사용되는 비밀키
- REFRESH_SECRET_KEY : 리프레쉬 토큰에 사용되는 비밀키
