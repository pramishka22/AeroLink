function SkeletonLoader({ type, count = 3 }) {
    if (type === "table") {
      return (
        <div className="skeleton-card">
          {Array(count).fill(0).map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton" style={{ height: 40 }}></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (type === "list") {
      return (
        <div className="skeleton-card">
          {Array(count).fill(0).map((_, i) => (
            <div key={i} className="skeleton-item">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-title" style={{ width: "60%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "40%" }}></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (type === "stats") {
      return (
        <div className="stats-grid">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 30, margin: "0 auto 12px" }}></div>
              <div className="skeleton skeleton-text" style={{ width: "60%", margin: "0 auto" }}></div>
              <div className="skeleton skeleton-title" style={{ width: "50%", margin: "8px auto" }}></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="skeleton-card">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
      </div>
    );
  }
  
  export default SkeletonLoader;