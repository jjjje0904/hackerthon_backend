const express = require('express');
const cors = require('cors'); // cors 미들웨어 추가
const app = express();
const port = 3000;

const { connectDB, closeDB } = require('./config/db');

// 미들웨어 설정 및 라우트 등록
app.use(cors()); // 모든 도메인에 대해 CORS 허용
app.use(express.json());

// 라우트 파일들 임포트
const programsRoutes = require('./routes/programs');

// 라우트 등록
app.use('/programs', programsRoutes);


// 서버 시작
connectDB().then(() => {
    app.listen(port, () => console.log(`App is listening on port ${port}`));
});

// 서버 종료 시 몽고디비 연결 닫기
process.on('SIGINT', async () => {
    await closeDB();
    process.exit();
});
