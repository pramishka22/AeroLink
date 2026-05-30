import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = 'https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod';

export default function () {

  http.get(`${BASE_URL}/flights`);

  sleep(0.5);
}