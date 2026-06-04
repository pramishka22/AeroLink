test("booking reduces available seats", () => {
    const flight = {
      id: "FL001",
      availableSeats: 100
    };
  
    const booking = {
      flightId: "FL001",
      seatsBooked: 2
    };
  
    flight.availableSeats -= booking.seatsBooked;
  
    expect(flight.availableSeats).toBe(98);
  });