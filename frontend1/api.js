const apiUrl = '/programs/specificInfo/:programId'; // API 엔드포인트 URL

fetch(apiUrl) // fetch를 사용하여 API 호출
  .then(response => {
    if (!response.ok) {
      throw new Error('API 요청 실패');
    }
    return response.json(); // 응답 데이터를 JSON으로 파싱
  })
  .then(data => { // 데이터 처리 및 표시 로직
    console.log('받아온 데이터: ', data); // 받은 데이터를 로그에 출력하거나 활용
  })
  .catch(error => {
    console.error('에러 발생: ', error);
  });
