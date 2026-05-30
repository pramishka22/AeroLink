function Navbar({ message }) {
  return (
    <div className="topbar">
      <div>
        <h2>Operations Dashboard</h2>
        <p>{message}</p>
      </div>
      <span className="secure-badge">JWT Secured</span>
    </div>
  );
}

export default Navbar;