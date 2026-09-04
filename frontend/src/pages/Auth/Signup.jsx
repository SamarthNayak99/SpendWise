import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import './Auth.css'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await signup(form.email, form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />

      <div className="auth-card animate-fadeIn">
        <div className="auth-logo">
          <div className="auth-logo-icon">SW</div>
          <span className="auth-logo-text">SpendWise</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start tracking your finances today</p>

        {error && (
          <div className="auth-error" role="alert">{error}</div>
        )}

        <form id="signup-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-username" className="form-label">Username</label>
            <input
              id="signup-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="samarth_nayak"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm" className="form-label">Confirm Password</label>
            <input
              id="signup-confirm"
              name="confirm"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            id="signup-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            Create Account
          </Button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login" id="go-to-login-link">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
