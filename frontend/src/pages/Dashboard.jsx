import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import SearchBar from "../components/SearchBar";

const API = "https://yzyfq3ys00.execute-api.us-east-1.amazonaws.com/prod";

function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [baggage, setBaggage] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("System ready");
  const [selectedBaggageId, setSelectedBaggageId] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState("");
  const [checkIns, setCheckIns] = useState([]);
  const [selectedCheckInBookingId, setSelectedCheckInBookingId] = useState("");
  const [checkInResult, setCheckInResult] = useState(null);
  const [airportEvents, setAirportEvents] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    flights: false,
    bookings: false,
    baggage: false,
    notifications: false,
    users: false,
    checkIns: false,
    airportEvents: false
  });
  const [searchStates, setSearchStates] = useState({
    bookings: "",
    baggage: "",
    checkIns: "",
    users: "",
    airportEvents: "",
    notifications: ""
  });
  const [airportForm, setAirportForm] = useState({
    flightId: "",
    airportCode: "CMB",
    gate: "G12",
    status: "BOARDING_OPEN",
    message: ""
  });
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    airline: "AeroLink",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    totalSeats: "",
    status: "Scheduled"
  });

  const [flightUpdate, setFlightUpdate] = useState({
    price: "",
    status: "",
    departureTime: "",
    arrivalTime: ""
  });

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [paymentResult, setPaymentResult] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    flightId: "",
    seatsBooked: 1
  });

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const isAdminOrStaff = userRole === "admin" || userRole === "staff";

  if (!token) {
    window.location.href = "/#/login";
    return null;
  }

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const showError = (error) => {
    setMessage(
      error.response?.data?.message ||
      "Service temporarily unavailable. Please try again shortly."
    );
  };

  const failureCountRef = useRef(0);
  const circuitOpenUntilRef = useRef(null);
  
  const circuitBreakerRequest = async (requestFunction) => {
    const now = Date.now();
  
    if (circuitOpenUntilRef.current && now < circuitOpenUntilRef.current) {
      throw new Error("Circuit breaker is open. Service temporarily unavailable.");
    }
  
    try {
      const result = await requestFunction();
      failureCountRef.current = 0;
      circuitOpenUntilRef.current = null;
      return result;
    } catch (error) {
      failureCountRef.current += 1;
  
      if (failureCountRef.current >= 3) {
        circuitOpenUntilRef.current = Date.now() + 30000;
      }
  
      throw error;
    }
  };

  const apiRequest = async (requestFunction, retries = 2) => {
    try {
      return await requestFunction();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return apiRequest(requestFunction, retries - 1);
      }
      throw error;
    }
  };

  const loadFlights = async () => {
    setLoadingStates(prev => ({ ...prev, flights: true }));
    try {
      const res = await apiRequest(() => axios.get(`${API}/flights`));
      setFlights(res.data);
      setMessage("Flights loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, flights: false }));
    }
  };

  const loadBookings = async () => {
    setLoadingStates(prev => ({ ...prev, bookings: true }));
    try {
      const res = await circuitBreakerRequest(() =>
        axios.get(`${API}/bookings`, authHeader)
      );
      setBookings(res.data);
      setMessage("Bookings loaded");
    } catch (error) {
      setMessage(error.message || "Booking Service temporarily unavailable.");
    } finally {
      setLoadingStates(prev => ({ ...prev, bookings: false }));
    }
  };

  const validatePayment = () => {
    const cardNumber = payment.cardNumber.replace(/\s/g, "");
    const cvv = payment.cvv.trim();
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  
    if (!bookingForm.flightId) {
      return "Please select a flight.";
    }
  
    if (!bookingForm.seatsBooked || Number(bookingForm.seatsBooked) < 1) {
      return "Please enter at least 1 seat.";
    }
  
    if (!payment.cardName.trim()) {
      return "Please enter cardholder name.";
    }
  
    if (!/^\d{16}$/.test(cardNumber)) {
      return "Card number must be 16 digits. Example: 4111111111111111";
    }
  
    if (!expiryRegex.test(payment.expiry)) {
      return "Expiry must be in MM/YY format. Example: 12/30";
    }
  
    if (!/^\d{3}$/.test(cvv)) {
      return "CVV must be 3 digits. Example: 123";
    }
  
    return null;
  };

  const createBooking = async () => {
    try {
      const validationError = validatePayment();
  
      if (validationError) {
        setMessage(validationError);
        return;
      }
  
      const selectedFlight = flights.find(
        (flight) => String(flight.id) === String(bookingForm.flightId)
      );
  
      const amount = selectedFlight
        ? Number(selectedFlight.price) * Number(bookingForm.seatsBooked)
        : 0;
  
      setMessage("Processing payment provider...");
  
      const paymentRes = await axios.post(
        `${API}/payments/simulate`,
        {
          bookingId: `TEMP-${Date.now()}`,
          amount,
          provider: "Simulated Stripe Provider",
          cardNumber: payment.cardNumber
        }
      );
  
      setPaymentResult(paymentRes.data.payment);
  
      await axios.post(
        `${API}/bookings`,
        {
          flightId: bookingForm.flightId,
          seatsBooked: Number(bookingForm.seatsBooked),
          paymentStatus: paymentRes.data.payment.status,
          paymentMethod: paymentRes.data.payment.provider,
          transactionRef: paymentRes.data.payment.transactionRef
        },
        authHeader
      );
  
      setMessage(
        `Payment approved by ${paymentRes.data.payment.provider}. Booking created successfully.`
      );
  
      setPayment({
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
      });
  
      setBookingForm({
        flightId: "",
        seatsBooked: 1
      });
  
      await loadFlights();
      await loadBookings();
    } catch (error) {
      showError(error);
    }
  };

  const createBaggage = async () => {
    try {
      if (bookings.length === 0) {
        setMessage("Please load or create a booking first");
        return;
      }
  
      const latestBooking = bookings[bookings.length - 1];
  
      const res = await axios.post(
        `${API}/baggage`,
        {
          bookingId: latestBooking.id,
          passengerName: latestBooking.user,
          tagNumber: `BAG-${latestBooking.id}-${Date.now()}`
        },
        authHeader
      );
  
      setMessage(`Baggage record created for Booking #${latestBooking.id}`);
      setBaggage((prev) => [...prev, res.data.baggage]);
    } catch (error) {
      showError(error);
    }
  };

  const loadBaggage = async () => {
    setLoadingStates(prev => ({ ...prev, baggage: true }));
    try {
      const res = await apiRequest(() => axios.get(`${API}/baggage`, authHeader));     
      setBaggage(res.data);
      setMessage("Baggage loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, baggage: false }));
    }
  };

  const updateBaggage = async () => {
    try {
      if (!selectedBaggageId) {
        setMessage("Please select a baggage record first");
        return;
      }
  
      const selectedBaggage = baggage.find(
        (bag) => bag.id === selectedBaggageId
      );
  
      await axios.put(
        `${API}/baggage/${selectedBaggageId}/status`,
        { status: "Arrived at Destination" },
        authHeader
      );
  
      setMessage(
        `Baggage ${selectedBaggage?.tagNumber || selectedBaggageId} updated and notification generated`
      );
  
      await loadBaggage();
      await loadNotifications();
    } catch (error) {
      showError(error);
    }
  };

  const loadNotifications = async () => {
    setLoadingStates(prev => ({ ...prev, notifications: true }));
    try {
      const res = await apiRequest(() => axios.get(`${API}/notifications`, authHeader));      
      setNotifications(res.data);
      setMessage("Notifications loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, notifications: false }));
    }
  };

  const createFlight = async () => {
    try {
      await axios.post(`${API}/flights`, newFlight, authHeader);
  
      setMessage("Flight created successfully");
      setNewFlight({
        flightNumber: "",
        airline: "AeroLink",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: "",
        totalSeats: "",
        status: "Scheduled"
      });
  
      await loadFlights();
    } catch (error) {
      showError(error);
    }
  };
  
  const updateFlight = async () => {
    try {
      if (!selectedFlightId) {
        setMessage("Please select a flight first");
        return;
      }
  
      const payload = {};
  
      Object.keys(flightUpdate).forEach((key) => {
        if (flightUpdate[key] !== "") {
          payload[key] = flightUpdate[key];
        }
      });
  
      if (Object.keys(payload).length === 0) {
        setMessage("Please enter at least one flight update");
        return;
      }
  
      await axios.put(`${API}/flights/${selectedFlightId}`, payload, authHeader);
  
      setMessage("Flight schedule/pricing/status updated successfully");
      setFlightUpdate({
        price: "",
        status: "",
        departureTime: "",
        arrivalTime: ""
      });
  
      await loadFlights();
    } catch (error) {
      showError(error);
    }
  };

  const loadUsers = async () => {
    setLoadingStates(prev => ({ ...prev, users: true }));
    try {
      const res = await axios.get(`${API}/users`, authHeader);
      setUsers(res.data);
      setMessage("Users loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, users: false }));
    }
  };
  
  const updateUserRole = async (email, role) => {
    try {
      await axios.put(
        `${API}/users/${encodeURIComponent(email)}/role`,
        { role },
        authHeader
      );
  
      setMessage(`Role updated for ${email}`);
      await loadUsers();
    } catch (error) {
      showError(error);
    }
  };

  const loadCheckIns = async () => {
    setLoadingStates(prev => ({ ...prev, checkIns: true }));
    try {
      const res = await apiRequest(() => axios.get(`${API}/checkins`, authHeader));
      setCheckIns(res.data);
      setMessage("Check-ins loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, checkIns: false }));
    }
  };
  
  const createCheckIn = async () => {
    try {
      if (!selectedCheckInBookingId) {
        setMessage("Please select a booking before check-in");
        return;
      }
  
      const booking = bookings.find(
        (b) => String(b.id) === String(selectedCheckInBookingId)
      );
  
      if (!booking) {
        setMessage("Selected booking not found. Please load bookings first.");
        return;
      }
  
      const res = await axios.post(
        `${API}/checkins`,
        {
          bookingId: booking.id,
          flightId: booking.flightId,
          passengerName: booking.user || booking.userEmail || "Passenger"
        },
        authHeader
      );
  
      setCheckInResult(res.data.checkin);
      setMessage("Passenger check-in completed and boarding pass generated");
  
      await loadCheckIns();
    } catch (error) {
      showError(error);
    }
  };

  const loadAirportEvents = async () => {
    setLoadingStates(prev => ({ ...prev, airportEvents: true }));
    try {
      const res = await apiRequest(() => axios.get(`${API}/airport/events`));
      setAirportEvents(res.data);
      setMessage("Airport integration events loaded");
    } catch (error) {
      showError(error);
    } finally {
      setLoadingStates(prev => ({ ...prev, airportEvents: false }));
    }
  };
  
  const createAirportEvent = async () => {
    try {
      if (!airportForm.flightId || !airportForm.airportCode || !airportForm.status) {
        setMessage("Please select a flight and enter airport event details.");
        return;
      }
  
      const selectedFlight = flights.find(
        (flight) => String(flight.id) === String(airportForm.flightId)
      );
  
      const res = await axios.post(`${API}/airport/events`, {
        flightId: airportForm.flightId,
        airportCode: airportForm.airportCode,
        gate: airportForm.gate,
        status: airportForm.status,
        message:
          airportForm.message ||
          `Airport update for ${selectedFlight?.flightNumber || airportForm.flightId}`
      });
  
      setAirportEvents((prev) => [...prev, res.data.airportEvent]);
      setMessage("Airport operational event received successfully");
  
      setAirportForm({
        flightId: "",
        airportCode: "CMB",
        gate: "G12",
        status: "BOARDING_OPEN",
        message: ""
      });
    } catch (error) {
      showError(error);
    }
  };  

  useEffect(() => {
    loadFlights();
  }, []);

  const getFlightForBooking = (booking) => {
    return flights.find((flight) => String(flight.id) === String(booking.flightId));
  };

  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      return Object.values(item).some(value => 
        value && String(value).toLowerCase().includes(term)
      );
    });
  };

  const filteredBookings = filterItems(bookings, searchStates.bookings);
  const filteredBaggage = filterItems(baggage, searchStates.baggage);
  const filteredCheckIns = filterItems(checkIns, searchStates.checkIns);
  const filteredUsers = filterItems(users, searchStates.users);
  const filteredAirportEvents = filterItems(airportEvents, searchStates.airportEvents);
  const filteredNotifications = filterItems(notifications, searchStates.notifications);

  const updateSearch = (type, value) => {
    setSearchStates(prev => ({ ...prev, [type]: value }));
  };

  const clearSearch = (type) => {
    setSearchStates(prev => ({ ...prev, [type]: "" }));
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Navbar message={message} />
        
        <section id="dashboard-overview" className="hero">
          <div className="hero-content">
            <div className="hero-badge">Digital Airline Operations Hub</div>
            <h1 className="hero-title">AeroLink<br />Digital Airline Management Platform</h1>
            <p className="hero-description">
            Centralised operational dashboard for managing flight schedules, passenger services, baggage operations, payments, and airport events with real-time visibility across distributed airline services.</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{flights.length}</div>
              <div className="hero-stat-label">Active Flights</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{bookings.length}</div>
              <div className="hero-stat-label">Total Bookings</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{notifications.length}</div>
              <div className="hero-stat-label">Events</div>
            </div>
          </div>
        </section>

        <section id="dashboard-stats" className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Flights</span>
            <h2 className="stat-number">{flights.length}</h2>
            <p className="stat-description">Active flight records</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Bookings</span>
            <h2 className="stat-number">{bookings.length}</h2>
            <p className="stat-description">Confirmed passenger bookings</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Baggage</span>
            <h2 className="stat-number">{baggage.length}</h2>
            <p className="stat-description">Tracked baggage records</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Notifications</span>
            <h2 className="stat-number">{notifications.length}</h2>
            <p className="stat-description">Generated system events</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Check-ins</span>
            <h2 className="stat-number">{checkIns.length}</h2>
            <p className="stat-description">Generated boarding passes</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <span className="stat-label">Airport Events</span>
            <h2 className="stat-number">{airportEvents.length}</h2>
            <p className="stat-description">Third-party airport updates</p>
          </div>         
        </section>

        <section id="dashboard-flights" className="panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <h2>Flight Operations</h2>
              <p>Manage flight schedules, fares, seat availability, and operational status across the airline network.</p>
            </div>
            <div className="panel-header-actions">
              <button className="btn-primary" onClick={loadFlights}>Refresh Flights</button>
            </div>
          </div>

          {isAdminOrStaff && (
            <>
              <div className="actions-group">
                <select className="select-input" value={selectedFlightId} onChange={(e) => setSelectedFlightId(e.target.value)}>
                  <option value="">Select flight to update</option>
                  {flights.map((flight) => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flightNumber} | {flight.from} → {flight.to} | {flight.status}
                    </option>
                  ))}
                </select>
                <input className="text-input" placeholder="New price" value={flightUpdate.price} onChange={(e) => setFlightUpdate({ ...flightUpdate, price: e.target.value })} />
                <select className="select-input" value={flightUpdate.status} onChange={(e) => setFlightUpdate({ ...flightUpdate, status: e.target.value })}>
                  <option value="">Update status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Departed">Departed</option>
                </select>
                <input className="text-input" type="datetime-local" value={flightUpdate.departureTime} onChange={(e) => setFlightUpdate({ ...flightUpdate, departureTime: e.target.value })} />
                <input className="text-input" type="datetime-local" value={flightUpdate.arrivalTime} onChange={(e) => setFlightUpdate({ ...flightUpdate, arrivalTime: e.target.value })} />
                <button className="btn-secondary" onClick={updateFlight}>Update Flight</button>
              </div>

              <div className="flight-form">
                <h3>Create New Flight</h3>
                <div className="form-grid">
                  <input className="text-input" placeholder="Flight number" value={newFlight.flightNumber} onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })} />
                  <input className="text-input" placeholder="From" value={newFlight.from} onChange={(e) => setNewFlight({ ...newFlight, from: e.target.value })} />
                  <input className="text-input" placeholder="To" value={newFlight.to} onChange={(e) => setNewFlight({ ...newFlight, to: e.target.value })} />
                  <input className="text-input" type="datetime-local" value={newFlight.departureTime} onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })} />
                  <input className="text-input" type="datetime-local" value={newFlight.arrivalTime} onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} />
                  <input className="text-input" placeholder="Price" value={newFlight.price} onChange={(e) => setNewFlight({ ...newFlight, price: e.target.value })} />
                  <input className="text-input" placeholder="Total seats" value={newFlight.totalSeats} onChange={(e) => setNewFlight({ ...newFlight, totalSeats: e.target.value })} />
                  <select className="select-input" value={newFlight.status} onChange={(e) => setNewFlight({ ...newFlight, status: e.target.value })}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={createFlight}>Create Flight</button>
              </div>
            </>
          )}

          {loadingStates.flights ? (
            <SkeletonLoader type="table" count={5} />
          ) : (
            <div className="data-table">
              {flights.map((flight) => (
                <div className="table-row" key={flight.id}>
                  <div className="table-cell">
                    <strong>{flight.flightNumber}</strong>
                    <span>{flight.airline}</span>
                  </div>
                  <div className="table-cell">{flight.from} → {flight.to}</div>
                  <div className="table-cell">${flight.price}</div>
                  <div className="table-cell"><span className="badge-success">{flight.availableSeats} seats left</span></div>
                  <div className="table-cell">{flight.status}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="dashboard-bookings" className="panel two-column">
          <div className="panel-section">
            <h2>Passenger Booking</h2>
            <p>Create and manage passenger reservations with automated seat allocation, fare calculation, payment verification, and inventory updates.</p>
            <div className="payment-card">
              <h3>Select Flight</h3>
              <p>Choose the flight you want to book before making the payment.</p>
              <div className="form-grid">
                <select className="select-input" value={bookingForm.flightId} onChange={(e) => setBookingForm({ ...bookingForm, flightId: e.target.value })}>
                  <option value="">Select a flight</option>
                  {flights.map((flight) => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flightNumber} | {flight.from} → {flight.to} | ${flight.price} | {flight.availableSeats} seats
                    </option>
                  ))}
                </select>
                <input className="text-input" type="number" min="1" placeholder="Seats" value={bookingForm.seatsBooked} onChange={(e) => setBookingForm({ ...bookingForm, seatsBooked: e.target.value })} />
              </div>
            </div>
            <div className="payment-card">
              <h3>Payment Details</h3>
              <p>Test card: 4111111111111111, Expiry 12/30, CVV 123</p>
              <div className="form-grid">
                <input className="text-input" placeholder="Cardholder name" value={payment.cardName} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} />
                <input className="text-input" placeholder="Card number" maxLength="16" value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, "") })} />
                <input className="text-input" placeholder="MM/YY" maxLength="5" value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} />
                <input className="text-input" placeholder="CVV" maxLength="3" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "") })} />
              </div>
              {paymentResult && (
                <div className="payment-success">
                  <strong>Payment Approved</strong>
                  <p>Provider: {paymentResult.provider}</p>
                  <p>Status: {paymentResult.status}</p>
                  <p>Transaction Ref: {paymentResult.transactionRef}</p>
                  <p>Card Last 4: **** {paymentResult.last4}</p>
                </div>
              )}
            </div>
            <div className="actions-group">
              <button className="btn-primary" onClick={createBooking}>Create Booking</button>
              <button className="btn-secondary" onClick={loadBookings}>Load Bookings</button>
            </div>
          </div>
          
          <div className="panel-section">
            <div className="search-wrapper">
              <SearchBar placeholder="Search bookings..." value={searchStates.bookings} onChange={(val) => updateSearch("bookings", val)} onSearch={() => {}} />
            </div>
            {loadingStates.bookings ? (
              <SkeletonLoader type="list" count={5} />
            ) : (
              <>
                {searchStates.bookings && (
                  <div className="filter-summary">
                    <span>Found {filteredBookings.length} results</span>
                    <button className="clear-filters" onClick={() => clearSearch("bookings")}>Clear</button>
                  </div>
                )}
                <div className="list-container">
                  <div className="data-list">
                    {filteredBookings.length === 0 ? (
                      <div className="empty-state">No bookings found</div>
                    ) : (
                      filteredBookings.map((booking) => {
                        const flight = getFlightForBooking(booking);
                        return (
                          <div className="list-item" key={booking.id}>
                            <strong>Booking #{booking.id}</strong>
                            {flight ? (
                              <p>{flight.flightNumber} {flight.airline}, {flight.from} → {flight.to}, ${flight.price}</p>
                            ) : (
                              <p>Flight ID: {booking.flightId}</p>
                            )}
                            <p>{booking.user} booked {booking.seatsBooked} seat(s)</p>
                            <p>Booked at: {booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : "N/A"}</p>
                            <span className="list-item-badge">{booking.status}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section id="dashboard-checkin" className="panel two-column">
          <div className="panel-section">
            <h2>Passenger Check-In</h2>
            <p>Process passenger check-ins and generate boarding passes with assigned seats, gate information, and travel records.</p>
            <div className="actions-group">
              <select className="select-input" value={selectedCheckInBookingId} onChange={(e) => setSelectedCheckInBookingId(e.target.value)}>
                <option value="">Select booking for check-in</option>
                {bookings.map((booking) => {
                  const flight = getFlightForBooking(booking);
                  return (
                    <option key={booking.id} value={booking.id}>
                      Booking #{booking.id}
                      {flight ? ` | ${flight.flightNumber} ${flight.from} → ${flight.to}` : ` | Flight ${booking.flightId}`}
                    </option>
                  );
                })}
              </select>
              <button className="btn-primary" onClick={createCheckIn}>Check In Passenger</button>
              <button className="btn-secondary" onClick={loadCheckIns}>Load Check-Ins</button>
            </div>
            {checkInResult && (
              <div className="payment-success">
                <strong>Boarding Pass Generated</strong>
                <p>Passenger: {checkInResult.passengerName}</p>
                <p>Booking ID: #{checkInResult.bookingId}</p>
                <p>Boarding Pass: {checkInResult.boardingPassNumber}</p>
                <p>Seat: {checkInResult.seatNumber}</p>
                <p>Gate: {checkInResult.gate}</p>
                <p>Status: {checkInResult.checkInStatus}</p>
              </div>
            )}
          </div>
          <div className="panel-section">
            <div className="search-wrapper">
              <SearchBar placeholder="Search check-ins..." value={searchStates.checkIns} onChange={(val) => updateSearch("checkIns", val)} onSearch={() => {}} />
            </div>
            {loadingStates.checkIns ? (
              <SkeletonLoader type="list" count={5} />
            ) : (
              <>
                {searchStates.checkIns && (
                  <div className="filter-summary">
                    <span>Found {filteredCheckIns.length} results</span>
                    <button className="clear-filters" onClick={() => clearSearch("checkIns")}>Clear</button>
                  </div>
                )}
                <div className="list-container">
                  <div className="data-list">
                    {filteredCheckIns.length === 0 ? (
                      <div className="empty-state">No check-ins found</div>
                    ) : (
                      filteredCheckIns.map((checkin) => (
                        <div className="list-item" key={checkin.id}>
                          <strong>{checkin.boardingPassNumber}</strong>
                          <p>Passenger: {checkin.passengerName}</p>
                          <p>Booking ID: #{checkin.bookingId}</p>
                          <p>Flight ID: {checkin.flightId}</p>
                          <p>Seat: {checkin.seatNumber}</p>
                          <p>Gate: {checkin.gate}</p>
                          <span className="list-item-badge">{checkin.checkInStatus}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section id="dashboard-baggage" className="panel two-column">
          <div className="panel-section">
            <h2>Baggage Tracking</h2>
            <p>Register, track, and manage passenger baggage throughout the travel journey with automated operational notifications.</p>
            <div className="actions-group">
              <button className="btn-primary" onClick={createBaggage}>Create Baggage</button>
              <select className="select-input" value={selectedBaggageId} onChange={(e) => setSelectedBaggageId(e.target.value)}>
                <option value="">Select baggage record</option>
                {baggage.map((bag) => (
                  <option key={bag.id} value={bag.id}>
                    {bag.tagNumber} | {bag.passengerName} | {bag.status}
                  </option>
                ))}
              </select>
              <button className="btn-secondary" onClick={updateBaggage} disabled={!selectedBaggageId}>Update Status</button>
              <button className="btn-secondary" onClick={loadBaggage}>Load Baggage</button>
            </div>
          </div>
          <div className="panel-section">
            <div className="search-wrapper">
              <SearchBar placeholder="Search baggage..." value={searchStates.baggage} onChange={(val) => updateSearch("baggage", val)} onSearch={() => {}} />
            </div>
            {loadingStates.baggage ? (
              <SkeletonLoader type="list" count={5} />
            ) : (
              <>
                {searchStates.baggage && (
                  <div className="filter-summary">
                    <span>Found {filteredBaggage.length} results</span>
                    <button className="clear-filters" onClick={() => clearSearch("baggage")}>Clear</button>
                  </div>
                )}
                <div className="list-container">
                  <div className="data-list">
                    {filteredBaggage.length === 0 ? (
                      <div className="empty-state">No baggage records found</div>
                    ) : (
                      filteredBaggage.map((bag) => (
                        <div className={`list-item ${selectedBaggageId === bag.id ? 'selected' : ''}`} key={bag.id} onClick={() => setSelectedBaggageId(bag.id)}>
                          <strong>{bag.tagNumber}</strong>
                          <p>Passenger: {bag.passengerName}</p>
                          <p>Booking ID: #{bag.bookingId}</p>
                          <span className="list-item-badge">{bag.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {userRole === "admin" && (
          <section id="dashboard-users" className="panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <h2>User Management</h2>
                <p>Manage platform users, access permissions, and role assignments across passenger, staff, and administrative accounts.</p>
              </div>
              <div className="panel-header-actions">
                <SearchBar placeholder="Search users..." value={searchStates.users} onChange={(val) => updateSearch("users", val)} onSearch={() => {}} />
                <button className="btn-primary" onClick={loadUsers}>Load Users</button>
              </div>
            </div>
            {loadingStates.users ? (
              <SkeletonLoader type="list" count={5} />
            ) : (
              <>
                {searchStates.users && (
                  <div className="filter-summary">
                    <span>Found {filteredUsers.length} results</span>
                    <button className="clear-filters" onClick={() => clearSearch("users")}>Clear</button>
                  </div>
                )}
                <div className="list-container">
                  <div className="data-list">
                    {filteredUsers.length === 0 ? (
                      <div className="empty-state">No users found</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div className="list-item user-item" key={user.email}>
                          <div className="user-info">
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                            <span className="user-role">Current role: {user.role}</span>
                          </div>
                          <select className="select-input role-select" value={user.role} onChange={(e) => updateUserRole(user.email, e.target.value)}>
                            <option value="user">user</option>
                            <option value="passenger">passenger</option>
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {isAdminOrStaff && (
          <section id="dashboard-airport" className="panel two-column">
            <div className="panel-section">
              <h2>Airport Integration</h2>
              <p>Exchange operational updates with airport systems, including gate assignments, boarding activities, and flight status information.</p>
              <div className="form-grid">
                <select className="select-input" value={airportForm.flightId} onChange={(e) => setAirportForm({ ...airportForm, flightId: e.target.value })}>
                  <option value="">Select flight</option>
                  {flights.map((flight) => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flightNumber} | {flight.from} → {flight.to}
                    </option>
                  ))}
                </select>
                <input className="text-input" placeholder="Airport code" value={airportForm.airportCode} onChange={(e) => setAirportForm({ ...airportForm, airportCode: e.target.value })} />
                <input className="text-input" placeholder="Gate" value={airportForm.gate} onChange={(e) => setAirportForm({ ...airportForm, gate: e.target.value })} />
                <select className="select-input" value={airportForm.status} onChange={(e) => setAirportForm({ ...airportForm, status: e.target.value })}>
                  <option value="BOARDING_OPEN">BOARDING_OPEN</option>
                  <option value="GATE_ASSIGNED">GATE_ASSIGNED</option>
                  <option value="FINAL_CALL">FINAL_CALL</option>
                  <option value="BOARDING_CLOSED">BOARDING_CLOSED</option>
                  <option value="DEPARTED">DEPARTED</option>
                </select>
                <input className="text-input" placeholder="Message" value={airportForm.message} onChange={(e) => setAirportForm({ ...airportForm, message: e.target.value })} />
              </div>
              <div className="actions-group">
                <button className="btn-primary" onClick={createAirportEvent}>Send Airport Update</button>
                <button className="btn-secondary" onClick={loadAirportEvents}>Load Events</button>
              </div>
            </div>
            <div className="panel-section">
              <div className="search-wrapper">
                <SearchBar placeholder="Search airport events..." value={searchStates.airportEvents} onChange={(val) => updateSearch("airportEvents", val)} onSearch={() => {}} />
              </div>
              {loadingStates.airportEvents ? (
                <SkeletonLoader type="list" count={5} />
              ) : (
                <>
                  {searchStates.airportEvents && (
                    <div className="filter-summary">
                      <span>Found {filteredAirportEvents.length} results</span>
                      <button className="clear-filters" onClick={() => clearSearch("airportEvents")}>Clear</button>
                    </div>
                  )}
                  <div className="list-container">
                    <div className="data-list">
                      {filteredAirportEvents.length === 0 ? (
                        <div className="empty-state">No airport events found</div>
                      ) : (
                        filteredAirportEvents.map((event) => (
                          <div className="list-item" key={event.id}>
                            <strong>{event.status}</strong>
                            <p>Flight ID: {event.flightId}</p>
                            <p>Airport: {event.airportCode}</p>
                            <p>Gate: {event.gate}</p>
                            <p>{event.message}</p>
                            <span className="list-item-badge">{event.sourceSystem}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section id="dashboard-notifications" className="panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <h2>Event Notifications</h2>
              <p>Monitor operational alerts and service events generated across flight, baggage, booking, payment, and airport workflows.</p>
            </div>
            <div className="panel-header-actions">
              <SearchBar placeholder="Search notifications..." value={searchStates.notifications} onChange={(val) => updateSearch("notifications", val)} onSearch={() => {}} />
              <button className="btn-primary" onClick={loadNotifications}>Load Notifications</button>
            </div>
          </div>
          {loadingStates.notifications ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
            <>
              {searchStates.notifications && (
                <div className="filter-summary">
                  <span>Found {filteredNotifications.length} results</span>
                  <button className="clear-filters" onClick={() => clearSearch("notifications")}>Clear</button>
                </div>
              )}
              <div className="notification-list">
                {filteredNotifications.length === 0 ? (
                  <div className="empty-state">No notifications found</div>
                ) : (
                  filteredNotifications.map((note) => (
                    <div className="notification-item" key={note.id}>
                      <div className="notification-dot"></div>
                      <div className="notification-content">
                        <strong>{note.type}</strong>
                        <p>Booking ID: #{note.bookingId || "N/A"}</p>
                        <p className="notification-message">{note.message}</p>
                        <small>{new Date(note.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;