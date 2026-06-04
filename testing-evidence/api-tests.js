const axios = require("axios");

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

let token = "";

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.log(`FAIL - ${name}`);
    console.log(error.response?.data || error.message);
  }
}

(async () => {
  await test("Auth Login returns JWT", async () => {
    const res = await axios.post(`${API}/auth/login`, {
      email: "admin@aerolink.com",
      password: "Admin123"
    });

    token = res.data.token;
    if (!token) throw new Error("JWT token not returned");
  });

  await test("GET Flights returns list", async () => {
    const res = await axios.get(`${API}/flights`);
    if (res.status !== 200) throw new Error("Flights API failed");
  });

  await test("Bookings without JWT is rejected", async () => {
    try {
      await axios.get(`${API}/bookings`);
      throw new Error("Unauthorized request was allowed");
    } catch (error) {
      if (![401, 403].includes(error.response?.status)) {
        throw error;
      }
    }
  });

  await test("GET Bookings with JWT succeeds", async () => {
    const res = await axios.get(`${API}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status !== 200) throw new Error("Bookings API failed");
  });

  await test("Payment simulation succeeds", async () => {
    const res = await axios.post(`${API}/payments/simulate`, {
      bookingId: `TEST-${Date.now()}`,
      amount: 100,
      provider: "Simulated Stripe Provider",
      cardNumber: "4111111111111111"
    });

    if (!res.data.payment?.transactionRef) {
      throw new Error("Transaction reference not returned");
    }
  });

  await test("GET Baggage with JWT succeeds", async () => {
    const res = await axios.get(`${API}/baggage`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status !== 200) throw new Error("Baggage API failed");
  });

  await test("GET Notifications with JWT succeeds", async () => {
    const res = await axios.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status !== 200) throw new Error("Notifications API failed");
  });
})();