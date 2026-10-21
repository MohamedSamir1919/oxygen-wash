import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Settings, Sparkles, Truck, UserPlus } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'

function StaffShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user.role === 'admin'
  const home = isAdmin ? '/admin' : '/driver'
  const label = isAdmin ? 'لوحة الإدارة' : 'واجهة المندوب'
  const sectionLabel = location.pathname === '/admin/staff/new' ? 'إضافة موظف' : label
  const Icon = isAdmin ? Settings : Truck

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to={home} className="brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span><span className="brand-name">oxygen</span><span className="brand-caption">مساحة فريق العمل</span></span>
        </NavLink>
        <div className="nav-label">العمليات</div>
        <nav className="sidebar-nav">
          <NavLink to={home} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
          {isAdmin && <NavLink to="/admin/staff/new" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <UserPlus size={17} strokeWidth={1.8} /><span>إضافة موظف</span>
          </NavLink>}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">{user.username.slice(0, 1).toUpperCase()}</div>
            <div><div className="profile-name">{user.username}</div><div className="profile-note">{isAdmin ? 'مدير النظام' : 'مندوب'}</div></div>
          </div>
          <button type="button" className="staff-logout" onClick={logout}><LogOut size={15} /> تسجيل الخروج</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Oxygen <span style={{ padding: '0 7px', color: '#b5bdb8' }}>/</span> {sectionLabel}</div>
          <span className="staff-role"><Icon size={14} /> {isAdmin ? 'مدير' : 'مندوب'}</span>
        </header>
        <div key={location.pathname}><Outlet /></div>
      </main>
      <nav className={`mobile-nav staff-mobile-nav${isAdmin ? ' admin-mobile-nav' : ''}`}>
        <NavLink to={home} end className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} /><span>{label}</span></NavLink>
        {isAdmin && <NavLink to="/admin/staff/new" className={({ isActive }) => isActive ? 'active' : ''}><UserPlus size={19} /><span>إضافة موظف</span></NavLink>}
        <button type="button" onClick={logout}><LogOut size={19} /><span>خروج</span></button>
      </nav>
    </div>
  )
}

export default StaffShell