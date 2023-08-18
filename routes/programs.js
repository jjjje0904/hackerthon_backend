const express = require('express');
const router = express.Router();
const Program = require('../models/models');
const { client } = require('../config/db'); 
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const geolib = require('geolib'); // geolib 라이브러리 사용

router.get('/', async(req, res) => {
    try {
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('programs');
        const query = {"name": {$exists: true}};
        // projection 제거하여 모든 필드를 가져오도록 설정
        const cursor = collection.find(query);
        const result = [];

        await cursor.forEach(doc => {
            result.push(doc);
        });
        res.json(result);
    } catch (err) {
        console.log({err});
        res.status(500).json({error: "An error occurred"});
    }
    finally {
        await client.close();
    }
});


router.get('/keyword/:keyword', async(req, res) => {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");
        const keyword = req.params.keyword;

        const query = {"name": {$regex: keyword, $options: 'i'}};
        // const projection = {"_id": 0}; // _id 필드 제외한 모든 필드 포함

        const cursor = collection.find(query);

        const result = [];
        await cursor.forEach(doc => {
            result.push(doc); // 객체 전체를 추가
        });
        res.json(result);
    } catch (err) {
        console.log({err});
        res.status(500).json({error: "An error occurred"});
    }
    finally {
        await client.close();
    }
});


router.get('/location', async (req, res) => {
    try{
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");

        const keyword = req.query.keyword;

        const area = req.query.area;
        const subarea = req.query.subarea;
        

        let query ={};

        
        if(keyword){
            query["name"] = { $regex: keyword, $options: 'i' };
        }
        if (area && area !== "전체") {
            query["location.city"] = area;
        }

        if (subarea && subarea !== "전체") {
            query["location.gugun"] = subarea;
        }

        const cursor = collection.find(query);

        const result =[];
        await cursor.forEach(doc => {
            result.push(doc);
        });
        res.json(result);
    }catch (err) {
        console.log({err});
        res.status(500).json({error: "An error occurred"});
    }
    finally{
        await client.close();
    }
});


router.post('/apply/:programId', async (req, res) => {
    const programId = req.params.programId; // 파라미터에서 programId 추출

    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");
    
        const query = { _id: ObjectId.isValid(programId) ? new ObjectId(programId) : programId };
        const program = await collection.findOne(query);
    
        if (!program) {
            return res.status(404).json({ message: '프로그램을 찾을 수 없습니다.' });
        }

        const currentDate = new Date();
        const applicationStart = new Date(program.applicationDate.applicationStart);
        const applicationEnd = new Date(program.applicationDate.applicationEnd);

        // 현재 시점이 신청 시작일보다 이전인 경우
        if (currentDate < applicationStart) {
            return res.status(200).json({ message: '아직 신청 기간이 시작되지 않았습니다.' });
        }

        // 현재 시점이 신청 종료일보다 이후인 경우
        if (currentDate > applicationEnd) {
            return res.status(200).json({ message: '신청 기간이 이미 종료되었습니다.' });
        }

        // 신청인수 증가 및 프로그램 업데이트
        program.applicationCount += 1;
        await collection.updateOne(query, { $set: program });

        return res.status(200).json({ message: '신청이 완료되었습니다.' });
    } catch (error) {
        console.error('Error applying:', error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});




// /programs/specificInfo/:programId 엔드포인트에서 GET 요청 처리
router.get('/specificInfo/:programId', async (req, res) => {
    const programId = req.params.programId; // 파라미터에서 programId 추출

    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");
    
        const query = { _id: ObjectId.isValid(programId) ? new ObjectId(programId) : programId };
        const program = await collection.findOne(query);
    
        if (!program) {
            return res.status(404).json({ message: '프로그램을 찾을 수 없습니다.' });
        }

        // 프로그램 데이터를 JSON 형식으로 응답
        return res.status(200).json(program);
    } catch (error) {
        console.error('Error retrieving program details:', error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});



router.get('/popular', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");

        const keyword = req.query.keyword; // 키워드
        const area = req.query.area; // 지역
        const subarea = req.query.subarea; // 상세지역

        let query = {};

        if (keyword) {
            query["name"] = { $regex: keyword, $options: 'i' };
        }

        if (area && area !== "전체") {
            query["location.city"] = area;
        }

        if (subarea && subarea !== "전체") {
            query["location.gugun"] = subarea;
        }

        let cursor = collection.find(query);

        // 프로그램을 신청인수 기준으로 내림차순 정렬
        cursor = cursor.sort({ "applicationCount": -1 });

        const result = [];
        await cursor.forEach(doc => {
            result.push(doc);
        });

        res.json(result);
    } catch (err) {
        console.log({ err });
        res.status(500).json({ error: "An error occurred" });
    } finally {
        await client.close();
    }
});

// 현위치 기반 프로그램 조회 API
router.post('/nearby', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("programs");

        const userLatitude = parseFloat(req.body.latitude); // 사용자 위도
        const userLongitude = parseFloat(req.body.longitude); // 사용자 경도

        const keyword = req.body.keyword; // 키워드
        const area = req.body.area; // 지역
        const subarea = req.body.subarea; // 상세지역

        let query = {};

        if (keyword) {
            query["name"] = { $regex: keyword, $options: 'i' };
        }

        if (area && area !== "전체") {
            query["location.city"] = area;
        }

        if (subarea && subarea !== "전체") {
            query["location.gugun"] = subarea;
        }

        let cursor = collection.find(query);

        const docList = [];
        await cursor.forEach(doc => {
            const programLatitude = doc.location.latitude; // 프로그램 위도
            const programLongitude = doc.location.longitude; // 프로그램 경도

            const distance = geolib.getDistance(
                { latitude: userLatitude, longitude: userLongitude },
                { latitude: programLatitude, longitude: programLongitude }
            );

            // 반경 30km 이내의 프로그램만 결과에 추가
            if (distance <= 30000) {
                docList.push(doc);
            }
        });

        // docList를 거리를 기준으로 오름차순 정렬
        docList.sort((a, b) => {
            const distanceA = geolib.getDistance(
                { latitude: userLatitude, longitude: userLongitude },
                { latitude: a.location.latitude, longitude: a.location.longitude }
            );

            const distanceB = geolib.getDistance(
                { latitude: userLatitude, longitude: userLongitude },
                { latitude: b.location.latitude, longitude: b.location.longitude }
            );

            return distanceA - distanceB;
        });

        res.json(docList);
    } catch (err) {
        console.log({ err });
        res.status(500).json({ error: "An error occurred" });
    } finally {
        await client.close();
    }
});






module.exports = router;






