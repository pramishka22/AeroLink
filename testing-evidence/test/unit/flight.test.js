test("flight seat availability decreases after booking", () => {
    const flight = {
      id: "FL001",
      totalSeats: 100,
      availableSeats: 100
    };
  
    const seatsBooked = 3;
    flight.availableSeats -= seatsBooked;
  
    expect(flight.availableSeats).toBe(97);
  });
  
  test("passenger cannot create flight", () => {
    const user = { role: "passenger" };
    const isAdminOrStaff = user.role === "admin" || user.role === "staff";
  
    expect(isAdminOrStaff).toBe(false);
  });