import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
};

const BASE_URL = 'https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod';

export default function () {

  http.get(`${BASE_URL}/flights`);

  http.get(`${BASE_URL}/notifications`, {
    headers: {
      Authorization: 'Bearer TEST_TOKEN'
    }
  });

  sleep(1);
}