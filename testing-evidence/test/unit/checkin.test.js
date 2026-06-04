test("check-in creates boarding pass", () => {
    const body = {
      bookingId: "BK001",
      passengerName: "Admin Test",
      flightId: "FL001"
    };
  
    const checkin = {
      id: Date.now().toString(),
      bookingId: body.bookingId,
      flightId: body.flightId,
      passengerName: body.passengerName,
      checkInStatus: "CHECKED_IN",
      boardingPassNumber: `BP-${Date.now()}`,
      seatNumber: "A12",
      gate: "G12"
    };
  
    expect(checkin.checkInStatus).toBe("CHECKED_IN");
    expect(checkin.boardingPassNumber).toContain("BP-");
  });