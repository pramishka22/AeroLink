import { useNavigate } from "react-router-dom";

function Sidebar({ setToken }) {
    const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
  
    setToken(null);
  
    navigate("/login", { replace: true });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }; v

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L2 9L16 16L30 9L16 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 16L16 23L30 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 23L16 30L30 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="brand-text">
          <h2>AeroLink</h2>
          <span>Cloud Operations</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar-large">
          <span>{userEmail ? userEmail.charAt(0).toUpperCase() : "U"}</span>
        </div>
        <div className="user-details">
          <strong>{userEmail || "Guest"}</strong>
          <span>Role: {userRole || "user"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item" onClick={() => scrollToSection("dashboard-overview")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12V18L12 22L19 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Overview</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection("dashboard-flights")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 17L12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2 12L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17 12L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Flights</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection("dashboard-bookings")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Bookings</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection("dashboard-checkin")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Check-In</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection("dashboard-baggage")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 6V4C9 2.9 9.9 2 11 2H13C14.1 2 15 2.9 15 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Baggage</span>
        </button>
        <button className="nav-item" onClick={() => scrollToSection("dashboard-notifications")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C18 4.7 15.3 2 12 2C8.7 2 6 4.7 6 8V11.6C6 12.4 5.6 13.1 5 13.6C4.2 14.2 3.7 15.1 3.7 16.1C3.7 18.1 5.3 19.7 7.3 19.7H16.7C18.7 19.7 20.3 18.1 20.3 16.1C20.3 15.1 19.8 14.2 19 13.6C18.4 13.1 18 12.4 18 11.6V8Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 19.7V20.5C10 21.6 10.9 22.5 12 22.5C13.1 22.5 14 21.6 14 20.5V19.7" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Notifications</span>
        </button>
        {userRole === "admin" && (
          <button className="nav-item" onClick={() => scrollToSection("dashboard-users")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 20V19C5 15.1 8.1 12 12 12C15.9 12 19 15.1 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Users</span>
          </button>
        )}
        {(userRole === "admin" || userRole === "staff") && (
          <button className="nav-item" onClick={() => scrollToSection("dashboard-airport")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 9H22L16 14L19 21L12 17L5 21L8 14L2 9H9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Airport</span>
          </button>
        )}
      </nav>

      <button className="logout-btn" onClick={logout}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Sign Out</span>
      </button>
    </aside>
  );
}

export default Sidebar;