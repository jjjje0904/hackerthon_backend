const { MongoClient } = require('mongodb');
const { mongoURI } = require('./dev');

const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

const closeDB = async () => {
    await client.close();
    console.log('MongoDB connection closed');
};

module.exports = { connectDB, closeDB, client };