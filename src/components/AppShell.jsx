import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, ClipboardList, Headphones, KeyRound, LayoutDashboard, Shirt, Sparkles, Wallet } from 'lucide-react'
import { useOrder } from '../context/useOrder.js'

const clientLinks = [
  { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/catalog', label: 'الخدمات والأسعار', icon: Shirt },
  { to: '/orders', label: 'طلباتي', icon: ClipboardList },
]
function AppShell() {
  const { cartCount } = useOrder()
  const location = useLocation()
  const sectionName = location.pathname.startsWith('/admin') ? 'لوحة الإدارة'
    : location.pathname.startsWith('/driver') ? 'واجهة المندوب'
      : location.pathname.startsWith('/catalog') ? 'الخدمات والأسعار'
        : location.pathname.startsWith('/checkout') ? 'إتمام الطلب'
          : location.pathname.startsWith('/orders') ? 'طلباتي' : 'الرئيسية'

  function renderLink(item) {
    const Icon = item.icon
    return (
      <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        <Icon size={17} strokeWidth={1.8} />
        <span>{item.label}</span>
        {item.to === '/catalog' && cartCount > 0 && <span className="nav-count">{cartCount}</span>}
      </NavLink>
    )
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span><span className="brand-name">oxygen</span><span className="brand-caption">عنايتك تبدأ من هنا</span></span>
        </NavLink>
        <div className="nav-label">مساحة العميل</div>
        <nav className="sidebar-nav">{clientLinks.map(renderLink)}</nav>
        <div className="sidebar-bottom">
          <div className="help-box"><strong>محتاج مساعدة؟</strong><p>فريقنا معاك كل يوم من ٩ ص لـ ١١ م</p><a href="tel:19984"><Headphones size={14} /> تواصل مع الدعم</a></div>
          {/* <div className="profile"><div className="avatar">م</div><div><div className="profile-name">محمد أحمد</div><div className="profile-note">حساب العميل</div></div></div> */}
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Oxygen <span style={{ padding: '0 7px', color: '#b5bdb8' }}>/</span> {sectionName}</div>
          <div className="topbar-actions">
            <NavLink className="icon-button" to="/orders" aria-label="الطلبات"><Bell size={17} /></NavLink>
            <NavLink className="icon-button" to="/checkout" aria-label="السلة"><Wallet size={17} />{cartCount > 0 && <span style={{ position: 'absolute', margin: '-25px -25px 0 0', width: 8, height: 8, borderRadius: 99, background: '#f17a62' }} />}</NavLink>
            <NavLink className="icon-button" to="/staff/login" aria-label="دخول فريق العمل" title="دخول فريق العمل"><KeyRound size={16} /></NavLink>
          </div>
        </header>
        <Outlet />
      </main>
      <nav className="mobile-nav">
        {[...clientLinks, { to: '/checkout', label: 'السلة', icon: Wallet }].map((item) => {
          const Icon = item.icon
          return <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} /><span>{item.label}</span></NavLink>
        })}
      </nav>
    </div>
  )
}

export default AppShell