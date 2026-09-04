import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontSize: 'var(--font-size-sm)',
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.icon} {d.name}</p>
      <p style={{ color: d.color, fontWeight: 700 }}>{currency}{Number(d.total).toLocaleString()}</p>
      <p style={{ color: 'var(--text-muted)' }}>{d.percentage}% of total</p>
    </div>
  )
}

export default function CategoryPieChart({ data = [], currency = '₹' }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        No spending data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="total"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#4ade80'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          formatter={(value, entry) => (
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {entry.payload.icon} {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
