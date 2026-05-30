import http from 'k6/http';

export const options = {
  vus: 2,
  duration: '10s',
};

const BASE_URL = 'https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod';

const payload = JSON.stringify({
  flightId: "1779866900993",
  seatsBooked: 1,
  paymentStatus: "Paid",
  paymentMethod: "Simulated Card"
});

const params = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFlcm9saW5rLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3OTg2NjgyNSwiZXhwIjoxNzc5ODcwNDI1fQ.5vcZcpnGJnp_Mma9YYFpbUVwJWb8eZo6BoYhSHc-1rI'
  },
};

export default function () {
  http.post(`${BASE_URL}/bookings`, payload, params);
}