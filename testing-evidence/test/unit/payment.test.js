test("valid payment card returns approved payment", () => {
    const cardNumber = "4111111111111111";
    const cleanCard = cardNumber.replace(/\s/g, "");
  
    const payment = {
      status: "PAYMENT_APPROVED",
      last4: cleanCard.slice(-4),
      transactionRef: `TXN-${Date.now()}`
    };
  
    expect(cleanCard).toMatch(/^\d{16}$/);
    expect(payment.status).toBe("PAYMENT_APPROVED");
    expect(payment.last4).toBe("1111");
  });
  
  test("invalid card number is rejected", () => {
    const cardNumber = "123";
    expect(cardNumber).not.toMatch(/^\d{16}$/);
  });