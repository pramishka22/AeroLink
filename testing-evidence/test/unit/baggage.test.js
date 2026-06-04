test("baggage status updates correctly", () => {
    const baggage = {
      id: "BAG001",
      status: "Checked In"
    };
  
    baggage.status = "Arrived at Destination";
  
    expect(baggage.status).toBe("Arrived at Destination");
  });