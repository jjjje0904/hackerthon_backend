const nodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: 'AIzaSyAdKCH4c5wn-9u9DtKf-2mvUJdv8QURvaU' 
};

const geocoder = nodeGeocoder(options);

async function geocodeLocation(locationName) {
    try {
        const regionLatLongResult = await geocoder.geocode(locationName);

        if (regionLatLongResult && regionLatLongResult.length > 0) {
            const Lat = regionLatLongResult[0].latitude;
            const Long = regionLatLongResult[0].longitude;
            return { latitude: Lat, longitude: Long };
        } else {
            console.warn(`No geolocation data found for: ${locationName}`);
            return null; // 지리 좌표를 찾지 못한 경우 null 반환
        }
    } catch (error) {
        console.error(`Geocoding error: ${error.message}`);
        return null; // 오류 발생 시도 null 반환
    }
}

module.exports = geocodeLocation;
