import './StatCard.css'

/**
 * Dashboard summary stat card.
 * @param {string} label  - Card label e.g. "Total Balance"
 * @param {string} value  - Main value to display
 * @param {string} subtext - Optional smaller text below
 * @param {string} trend  - Optional trend indicator '+12%'
 * @param {string} trendDir - 'up' | 'down' | 'neutral'
 * @param {string} accent - 'green' | 'orange' | 'red' | 'blue' (left border color)
 * @param {string} icon   - Emoji icon
 */
export default function StatCard({ label, value, subtext, trend, trendDir = 'neutral', accent = 'green', icon }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      {(subtext || trend) && (
        <div className="stat-card-footer">
          {subtext && <span className="stat-card-subtext">{subtext}</span>}
          {trend && (
            <span className={`stat-card-trend stat-card-trend--${trendDir}`}>
              {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
