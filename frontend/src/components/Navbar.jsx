function Navbar({ message }) {
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-greeting">
          <h2>Operations Dashboard</h2>
          <div className="navbar-status">
            <span className="status-dot"></span>
            <p>{message}</p>
          </div>
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="user-avatar">
            <span>{userEmail ? userEmail.charAt(0).toUpperCase() : "U"}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{userEmail || "Guest"}</span>
            <span className="user-role">{userRole || "User"}</span>
          </div>
        </div>
        <div className="secure-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V12C4 17.5 7.5 22 12 22C16.5 22 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="8" r="1" fill="currentColor"/>
          </svg>
          <span>Secure</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;