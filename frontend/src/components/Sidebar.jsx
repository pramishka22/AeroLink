import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const isAdminOrStaff = userRole === "admin" || userRole === "staff";
  const isAdmin = userRole === "admin";

  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">A</div>
          <div>
            <h2>AeroLink</h2>
            <span>Airline Systems</span>
          </div>
        </div>

        <div className="user-box">
          <span>Logged in as</span>
          <strong>{userEmail || "Unknown user"}</strong>
          <small>Role: {userRole || "user"}</small>
        </div>

        <nav>
          <button className="nav-link" onClick={() => scrollToSection("overview")}>
            Overview
          </button>

          <button className="nav-link" onClick={() => scrollToSection("flights")}>
            Flights
          </button>

          <button className="nav-link" onClick={() => scrollToSection("bookings")}>
            Bookings
          </button>

          <button className="nav-link" onClick={() => scrollToSection("checkin")}>
            Check-In
          </button>

          <button className="nav-link" onClick={() => scrollToSection("baggage")}>
            Baggage
          </button>

          <button className="nav-link" onClick={() => scrollToSection("notifications")}>
            Notifications
          </button>

          {isAdminOrStaff && (
            <>
              <div className="nav-divider">Operations</div>

              <button className="nav-link" onClick={() => scrollToSection("airport")}>
                Airport Integration
              </button>

              <button className="nav-link" onClick={() => scrollToSection("immigration")}>
                Immigration Integration
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <div className="nav-divider">Administration</div>

              <button className="nav-link" onClick={() => scrollToSection("users")}>
                User Management
              </button>
            </>
          )}
        </nav>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;