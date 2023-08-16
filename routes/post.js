//index.js
const express = require('express');
const router = express.Router();
const { Board } = require('../models/info');
const { client } = require('../config/db'); 



router.post('/board/register', async(req, res) => {
    const { title, location, content } = req.body;

  try {
    await client.connect();
    const db = client.db("test"); // 데이터베이스 이름
    const collection = db.collection("boards");
    const document = {
      title: title,
      content: content,
      location: location
    };
    await collection.insertOne(document);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving data to MongoDB:", err);
    return res.json({ success: false, err });
  } finally {
    await client.close();
  }
})

router.get('/boards', async(req, res) => { 
    try {
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('boards');
        const query = {"title": {$exists: true}};
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
})

module.exports = router;