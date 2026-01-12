import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramped_load: {
      executor: 'ramping-arrival-rate',
      startRate: 10, // 10% awal
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 1000,
      stages: [
        { duration: '10s', target: 10 },   // 10%
        { duration: '40s', target: 100 },  // 100%
        { duration: '10s', target: 10 },   // 10%
      ],
    },
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const payload = JSON.stringify({
    full_name: `User ${__VU}-${__ITER}`,
    username: `user_${__VU}_${__ITER}`,
    password: 'password123',
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(`${BASE_URL}/auth/register`, payload, { headers });

  sleep(0.1); // kecil agar tetap agresif
}
