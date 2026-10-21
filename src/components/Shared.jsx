import { ArrowUpLeft, Check, CircleCheckBig } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>
      {action}
    </div>
  )
}

export function SectionHeading({ title, note, action }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}><div><h2 className="section-title">{title}</h2>{note && <p className="section-note">{note}</p>}</div>{action}</div>
}

export function StatCard({ label, value, foot, icon: Icon }) {
  return <div className="stat-card"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="stat-label">{label}</span>{Icon && <Icon size={17} color="#16765c" />}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>
}

export function StatusPill({ children, tone = 'success' }) {
  return <span className={`status-pill${tone === 'warning' ? ' warning' : tone === 'gray' ? ' gray' : ''}`}><CircleCheckBig size={12} />{children}</span>
}

export function OrderRow({ order }) {
  const tone = order.statusType === 'warning' ? 'warning' : order.statusType === 'gray' ? 'gray' : 'success'
  return <div className="order-row"><div><div className="order-number">{order.id}</div><div className="order-muted">{order.items}</div></div><div>{order.date}</div><div>{order.total} ج.م</div><div><StatusPill tone={tone}>{order.status}</StatusPill></div></div>
}

export function EmptyState({ title, text, to, action }) {
  return <div className="panel" style={{ display: 'grid', justifyItems: 'center', padding: '48px 20px', textAlign: 'center' }}><span className="service-icon" style={{ width: 52, height: 52, borderRadius: 16 }}><Check size={22} /></span><h2 className="section-title" style={{ marginTop: 15 }}>{title}</h2><p className="section-note" style={{ margin: '7px 0 18px' }}>{text}</p><Link to={to} className="primary-button">{action}<ArrowUpLeft size={15} /></Link></div>
}