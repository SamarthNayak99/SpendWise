import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }) {
  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  )
}
