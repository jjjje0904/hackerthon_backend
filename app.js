const express = require('express');
const cors = require('cors'); // cors 미들웨어 추가
const app = express();
const port = 4000;
const { connectDB, closeDB } = require('./config/db');
const bodyParser =  require('body-parser');

// 미들웨어 설정 및 라우트 등록
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // 프론트엔드 도메인
    methods: ['GET', 'POST'], // 허용할 HTTP 메서드
    credentials: true // 인증 정보 (쿠키 등) 전달 허용
  }));
app.use(express.json());

// 라우트 파일들 임포트
const programsRoutes = require('./routes/programs');
const postsRoutes = require('./routes/post');

// 라우트 등록
app.use('/programs', programsRoutes);
app.use('/api/posts',postsRoutes);


// 서버 시작
connectDB().then(() => {
    app.listen(port, () => console.log(`App is listening on port ${port}`));
});

// 서버 종료 시 몽고디비 연결 닫기
process.on('SIGINT', async () => {
    await closeDB();
    process.exit();
});
