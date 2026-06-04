test("EventBridge baggage event creates notification object", () => {
    const event = {
      source: "aerolink.baggage",
      "detail-type": "BAGGAGE_UPDATED",
      detail: {
        message: "Baggage arrived",
        bookingId: "BK001",
        userEmail: "admin@aerolink.com"
      }
    };
  
    const notification = {
      type: event["detail-type"],
      message: event.detail.message,
      bookingId: event.detail.bookingId,
      userEmail: event.detail.userEmail
    };
  
    expect(notification.type).toBe("BAGGAGE_UPDATED");
    expect(notification.bookingId).toBe("BK001");
  });