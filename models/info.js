//models/info.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const boardSchema = new Schema({
    title: {
        type: String,
        required: true
    }, //제목
    classification: {
        type: String,
        default: "일반"
    }, 
    indexNum: {
        type: Number,
        default: 1
    }, //순번
    createdAt: {
        type: Date,
        default: Date.now
    }, //작성날짜
    status: {
        type: String,
        default: "심사중"
    }, //반려, 심사중, 확정

    content: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
})

boardSchema.set('timestamps',{createdAt: true});

boardSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastDocument = await this.constructor.findOne({}, {}, { sort: { 'indexNum': -1 } });
            if (lastDocument) {
                this.indexNum = lastDocument.indexNum + 1;
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Board = mongoose.model('Board', boardSchema);
module.exports = { Board };