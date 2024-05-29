# Resumepage

## Node.js 숙련주차
- 백엔드 서버를 구성하기 위하여 mysql을 통한 데이터베이스 설계, 구현   
- 사용자 CRUD + 이력서 CRUD 및 jwt 토큰을 사용한 인증과 인가   
- 에러 처리 미들웨어, 인증 미들웨어, 인가 미들웨어   
- Joi를 이용한 유효성 검증 미들웨어 

## 실행 방법
1. .env 파일을 생성하여, 환경변수를 추가한다.   
2. yarn 명령으로 프로젝트에 필요한 패키지를 설치한다.   
3. yarn start명령으로 서버를 실행한다. (개발 시에는 yarn dev)   

## 환경변수   
SERVER_PORT: 서버가 실행 될 포트   
MONGODB_URL: MongoDB가 서비스되고 있는 URL   
MONGODB_NAME: MongoDB 데이터베이스 이름   
