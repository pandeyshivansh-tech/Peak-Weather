export default function SkeletonCard() {
  return (
    <div className="weather-dashboard glass">
      <div className="main-card skeleton-shimmer" style={{ minHeight: "260px" }}></div>
      <div className="dashboard-right">
        <div className="details-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="detail-item skeleton-shimmer" style={{ height: "76px" }}></div>
          ))}
        </div>
        <div className="forecast-section skeleton-shimmer" style={{ height: "140px" }}></div>
        <div className="forecast-section skeleton-shimmer" style={{ height: "200px" }}></div>
      </div>
    </div>
  );
}
