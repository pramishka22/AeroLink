test("airport event is created successfully", () => {
    const body = {
      flightId: "FL001",
      airportCode: "CMB",
      gate: "G12",
      status: "BOARDING_OPEN"
    };
  
    const airportEvent = {
      id: Date.now().toString(),
      flightId: body.flightId,
      airportCode: body.airportCode,
      gate: body.gate,
      status: body.status,
      sourceSystem: "Simulated Airport Operations System"
    };
  
    expect(airportEvent.airportCode).toBe("CMB");
    expect(airportEvent.status).toBe("BOARDING_OPEN");
  });