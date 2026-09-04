import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/',           icon: '▦',  label: 'Dashboard' },
  { path: '/expenses',   icon: '↕',  label: 'Expenses'  },
  { path: '/categories', icon: '◈',  label: 'Categories'},
  { path: '/budgets',    icon: '◎',  label: 'Budgets'   },
  { path: '/analytics',  icon: '◈',  label: 'Analytics' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">SW</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div className="sidebar-bottom">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
          }
          title="Profile"
        >
          <div className="sidebar-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </NavLink>
        <button
          className="sidebar-link sidebar-logout"
          onClick={logout}
          title="Logout"
        >
          <span className="sidebar-icon">⎋</span>
        </button>
      </div>
    </aside>
  )
}
