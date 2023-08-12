const puppeteer = require('puppeteer');
const geocodeAddress = require('../utils/geocoder');
const Program = require("../models/models");
const connectDB = require('../config/db');

// 데이터베이스 연결
connectDB();

function parseDateRange(dateRange) {
    const [startStr, endStr] = dateRange.split(' ~ ');
    const applicationStart = new Date(startStr);
    const applicationEnd = new Date(endStr);
    return { applicationStart, applicationEnd };
}

let num=1;
const crawler = async (nav, sidoCd) => {
    const browser = await puppeteer.launch({
        headless: false
    });   //브라우저를 열고
    global.page = await browser.newPage();   //새로운 창을 연다

    await page.goto(`http://www.lifelongedu.go.kr/man/sdy/courseAreaList.do?tm=11&sm=1&nav=${nav}&sidoCd=${sidoCd}`);
    scraping();
};

const rep = async(broswer) => {
    if (num <= 15){
        await page.click('#sub-wrap > div > div.course-bottom > div.pagination > a.direction.next');
        num += 1;
        scraping();
    } else{
        await broswer.close();
    }
}

const scraping = async() => {
    const titleElements = await page.$$('p.sdy-coursesTableSubTxt'); //프로그램명
    const placeElements = await page.$$('span.eduLocationDesc'); //프로그램장소명
    const instituteElements = await page.$$('span.instituteNm'); //주최기간
    const gugunElements = await page.$$('span.area'); //주최 군구
    const priceElements = await page.$$('span.enrollAmt'); //수강료
    const applyElements = await page.$$('span.receiveDt'); //접수기간
    const educateElements = await page.$$('span.data_em.courseDt'); //교육기간
    const homepgElements = await page.$$('span.linkUrl'); //홈페이지
    const phoneElements = await page.$$('span.inquiryTelNo'); //문의처

    let titleTexts = [];
    let placeTexts = [];
    let instituteTexts = [];
    let cityTexts = [];
    let gugunTexts = [];
    let priceTexts = [];
    let applyTexts = [];
    let educateTexts = [];
    let homepgTexts = [];
    let phoneTexts = [];

    for (const element of titleElements) {
        const text = await element.evaluate(node => node.innerText);
        titleTexts.push(text);
    }

    for (const element of placeElements) {
        const text = await element.evaluate(node => node.innerText);
        placeTexts.push(text);
    }

    for (const element of instituteElements) {
        const text = await element.evaluate(node => node.innerText);
        instituteTexts.push(text);
    }

    for (const element of gugunElements) {
        const text = await element.evaluate(node => node.innerText);
        gugunTexts.push(text);
    }

    for (const element of priceElements) {
        const text = await element.evaluate(node => node.innerText);
        priceTexts.push(text);
    }

    for (const element of applyElements) {
        const text = await element.evaluate(node => node.innerText);
        applyTexts.push(text);
    }

    for (const element of educateElements) {
        const text = await element.evaluate(node => node.innerText);
        educateTexts.push(text);
    }

    for (const element of homepgElements) {
        const text = await element.evaluate(node => node.innerText);
        homepgTexts.push(text);
    }

    for (const element of phoneElements) {
        const text = await element.evaluate(node => node.innerText);
        phoneTexts.push(text);
    }

    for (let i = 0; i < 10; i++) {
        try {
            const applyDate = parseDateRange(applyTexts[i]);
            const coordinates = await geocodeAddress(instituteTexts[i]);
            if(coordinates){
                let data = {
                    name: titleTexts[i], //프로그램명
                    applicationCount: 0, //프로그램신청인수
                    location: {
                        institute: instituteTexts[i],
                        specificlocation: placeTexts[i],
                        gugun: gugunTexts[i], // 구체적인 정보 (종로구, 강북구 등)
                        city: '제주', // 지역 정보 (서울, 제주 등)
                        latitude: coordinates.latitude, //장소 위도값
                        longitude: coordinates.longitude//장소 경도값
                        
                    }, //프로그램 장소명
                
                    price: priceTexts[i], //프로그램 수강료 => Number가 가능하다면 Number로 해도 좋을 듯 !
                    applicationDate: {
                        applicationStart: applyDate.applicationStart, //프로그램 접수시작기간
                        applicationEnd: applyDate.applicationEnd //프로그램 접수마감기간
                    },
                    programDate: educateTexts[i], //프로그램 교육기간
                    homepage: homepgTexts[i], 
                    phone: phoneTexts[i]
                };
                //console.log(data);
                const newProgram = new Program(data);
                await newProgram.save();
                console.log('Saved program data:', newProgram);

            }else{
                console.warn(`No geolocation data found for: ${data['institute']}`);
            }
        } catch (error) {
            console.error(`Error while processing data: ${error.message}`);
        }
    }

    rep();
};

// crawler(16,50);
/*
제주: crawler(16,50);
 */