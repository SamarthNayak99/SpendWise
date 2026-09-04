import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontSize: 'var(--font-size-sm)',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {currency}{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function TrendChart({ data = [], currency = '₹' }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
        No trend data yet. Add some expenses!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        <Line
          type="monotone"
          dataKey="income"
          stroke="var(--green)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--green)', r: 4 }}
          activeDot={{ r: 6 }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="var(--orange)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--orange)', r: 4 }}
          activeDot={{ r: 6 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
