const mongoose = require('mongoose');
const { Schema } = mongoose;

const programSchema = new Schema({
    name: {
        type: String
    }, //프로그램명
    applicationCount: {
        type: Number,
        default: 0
    }, //프로그램신청인수
    location: {
        institute: String,
		specificlocation: String,
        gugun: String, // 구체적인 정보 (종로구, 강북구 등)
        city: String, // 지역 정보 (서울, 제주 등)
        latitude: Number, //장소 위도값
        longitude: Number//장소 경도값
    }, //프로그램 장소명

    price: String, //프로그램 수강료 => Number가 가능하다면 Number로 해도 좋을 듯 !
    applicationDate: {
        applicationStart: Date, //프로그램 접수시작기간
        applicationEnd: Date //프로그램 접수마감기간
    },
    programDate: String, //프로그램 교육기간
    homepage: String, 
    phone: String
});
const Program = mongoose.model('Program', programSchema);

module.exports = Program;
