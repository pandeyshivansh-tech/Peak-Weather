// Holds the forecast's shape while it loads, so nothing jumps when it lands.
export default function SkeletonCard() {
  return (
    <div className="forecast" aria-busy="true" aria-label="Loading the forecast">
      <section className="now">
        <span className="bone" style={{ width: 180, height: 28 }} />
        <span className="bone" style={{ width: 260, height: 180, marginTop: 24 }} />
        <span className="bone" style={{ width: 200, height: 28, marginTop: 16 }} />
        <span className="bone" style={{ width: 280, height: 20, marginTop: 16 }} />
      </section>
      <div className="column">
        <div className="panel bone-panel" style={{ height: 220 }} />
        <div className="panel bone-panel" style={{ height: 420 }} />
      </div>
    </div>
  );
}
