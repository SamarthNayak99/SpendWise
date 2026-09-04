import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/auth'
import { useTheme } from '../../context/ThemeContext'
import Button from '../../components/common/Button'
import './Profile.css'

const CURRENCIES = [
  { symbol: '₹', label: 'INR — Indian Rupee (₹)' },
  { symbol: '$', label: 'USD — US Dollar ($)' },
  { symbol: '€', label: 'EUR — Euro (€)' },
  { symbol: '£', label: 'GBP — British Pound (£)' },
  { symbol: '¥', label: 'JPY — Japanese Yen (¥)' },
]

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({ username: user?.username || '', currency_symbol: user?.currency_symbol || '₹' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await authApi.updateMe(form)
      updateUser(res.data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>Profile</h1>

      <div className="profile-grid">
        {/* Account Info */}
        <div className="card">
          <h2 className="section-title">Account Settings</h2>

          {success && <div className="auth-error" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 'var(--space-4)' }}>{success}</div>}
          {error && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

          <form id="profile-form" className="auth-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input id="profile-username-input" className="form-input" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                minLength={3} required />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select id="profile-currency-input" className="form-select" value={form.currency_symbol}
                onChange={e => setForm(f => ({ ...f, currency_symbol: e.target.value }))}>
                {CURRENCIES.map(c => (
                  <option key={c.symbol} value={c.symbol}>{c.label}</option>
                ))}
              </select>
            </div>
            <Button id="profile-save-btn" type="submit" variant="primary" loading={loading}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Appearance */}
        <div className="card">
          <h2 className="section-title">Appearance</h2>
          <div className="theme-toggle-row">
            <div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                Currently using {theme} theme
              </p>
            </div>
            <button
              id="profile-theme-toggle"
              className={`theme-switch ${theme === 'light' ? 'theme-switch--on' : ''}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <div className="theme-switch-thumb" />
            </button>
          </div>

          {/* Account info */}
          <div className="profile-info" style={{ marginTop: 'var(--space-6)' }}>
            <div className="profile-info-row">
              <span className="profile-info-label">Member since</span>
              <span className="profile-info-value">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </span>
            </div>
          </div>

          {/* Danger zone */}
          <div className="danger-zone" style={{ marginTop: 'var(--space-8)' }}>
            <h3 style={{ color: 'var(--red)', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Danger Zone</h3>
            <Button id="logout-btn" variant="danger" onClick={logout} style={{ width: '100%' }}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
