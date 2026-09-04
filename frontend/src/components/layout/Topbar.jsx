import { useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import './Topbar.css'

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/expenses':   'Expenses',
  '/categories': 'Categories',
  '/budgets':    'Budgets',
  '/analytics':  'Analytics',
  '/profile':    'Profile',
}

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()

  const title = PAGE_TITLES[location.pathname] || 'SpendWise'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* User info */}
        <div className="topbar-user">
          <div className="topbar-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-username">{user?.username}</span>
            <span className="topbar-email">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
