export default function StatCard({ title, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <span className="stat-title">{title}</span>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}
