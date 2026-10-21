import { Check, MapPin, Navigation, PackageCheck, Phone, Printer, Shirt, Truck } from 'lucide-react'
import { PageHeading, SectionHeading, StatusPill } from '../components/Shared.jsx'
import { useOrder } from '../context/useOrder.js'
import { useAuth } from '../context/useAuth.js'
import { formatOrderDate, getOrderStatusLabel } from '../data/orders.js'

function DriverPage() {
  const { user } = useAuth()
  const { orders, loading, error, updateOrderStatus } = useOrder()
  const pendingTasks = orders.filter((order) => order.status !== 'delivered')
  const readyTasks = orders.filter((order) => order.status === 'ready_for_delivery')

  async function completeTask(order) {
    const nextStatus = order.status === 'assigned' ? 'picked_up' : 'delivered'
    try {
      await updateOrderStatus(order._id, nextStatus)
    } catch (taskError) {
      window.alert(taskError.message || 'تعذر تحديث المهمة')
    }
  }

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="مهام المندوب" title={`أهلاً يا ${user?.displayName || user?.username || 'مندوبنا'}`} subtitle={`عندك ${pendingTasks.length.toLocaleString('ar-EG')} طلبات مسندة إليك.`} action={<button className="secondary-button" onClick={() => window.print()}><Printer size={15} /> طباعة خط السير</button>} />
      {error && <p role="alert" style={{ marginBottom: 12, color: '#a13d32', fontSize: 12 }}>{error}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="stat-card"><div className="stat-label">الطلبات المسندة</div><div className="stat-value">{pendingTasks.length.toLocaleString('ar-EG')}</div><div className="stat-foot"><Truck size={13} /> استلام وتسليم</div></div>
        <div className="stat-card"><div className="stat-label">قطع جاهزة للتسليم</div><div className="stat-value">{readyTasks.reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0).toLocaleString('ar-EG')}</div><div className="stat-foot"><Shirt size={13} /> في طلبات جاهزة</div></div>
        <div className="stat-card"><div className="stat-label">طلبات مكتملة</div><div className="stat-value">{orders.filter((order) => order.status === 'delivered').length.toLocaleString('ar-EG')}</div><div className="stat-foot"><Check size={13} /> إجمالي ما تم تسليمه</div></div>
      </div>

      <section style={{ marginTop: 25 }}>
        <SectionHeading title="الطلبات المسندة إليك" note="بيانات العميل ومواعيد الطلب المسجلة" />
        <div style={{ display: 'grid', gap: 11 }}>
          {pendingTasks.map((task, index) => <article className="panel" key={task._id} style={{ padding: 17 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
              <span style={{ display: 'grid', width: 29, height: 29, flex: '0 0 auto', placeItems: 'center', borderRadius: 8, background: '#eaf4ef', color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>{index + 1}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}><strong style={{ fontSize: 12 }}>{task.customer.name}</strong><span className="order-muted" style={{ margin: 0 }}>{task.id}</span><StatusPill tone="warning">{getOrderStatusLabel(task.status)}</StatusPill></div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 11, color: '#53625b', fontSize: 10 }}><MapPin size={14} color="#16765c" style={{ flex: '0 0 auto' }} /><span>{task.customer.address}<span className="order-muted" style={{ display: 'block' }}>{task.customer.landmark}</span></span></div>
                <div className="order-muted" style={{ marginTop: 8 }}>الاستلام: {task.pickupWindow} · التسليم المتوقع: {formatOrderDate(task.expectedDeliveryAt)}</div>
                <div className="order-muted" style={{ marginTop: 8 }}>{task.items.map((item) => `${item.quantity} ${item.name} · ${item.service}`).join('، ')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 13, borderTop: '1px solid #f0f2ef', paddingTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Shirt size={15} color="#16765c" /><span style={{ fontSize: 10 }}>{task.items.reduce((sum, item) => sum + item.quantity, 0)} قطعة</span></div>
                  <div style={{ display: 'flex', gap: 7 }}><a className="icon-button" href={`tel:${task.customer.phone}`} aria-label={`اتصل بالعميل ${task.customer.name}`}><Phone size={15} /></a><a className="icon-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.customer.address)}`} target="_blank" rel="noreferrer" aria-label="افتح الموقع على خرائط جوجل"><Navigation size={15} /></a>{(task.status === 'assigned' || task.status === 'ready_for_delivery') && <button className="primary-button" style={{ minHeight: 35, paddingInline: 11 }} onClick={() => completeTask(task)}>{task.status === 'assigned' ? 'تم الاستلام' : 'تم التسليم'} <Check size={14} /></button>}</div>
                </div>
              </div>
            </div>
          </article>)}
          {loading && <div className="panel" style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل المهام...</div>}
          {!loading && pendingTasks.length === 0 && <div className="panel" style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>لا توجد مهام مسندة إليك حاليًا</div>}
        </div>
      </section>

      <section className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, padding: 17 }}><span className="service-icon"><PackageCheck size={20} /></span><div style={{ flex: 1 }}><strong style={{ fontSize: 12 }}>تفاصيل الطلبات</strong><p className="section-note">تم تحديث كل تغيير حالة مباشرة في سجل الطلب.</p></div><button className="secondary-button" onClick={() => window.print()}><Printer size={14} /> طباعة المهام</button><PackageCheck size={17} color="#16765c" /></section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, color: 'var(--muted)', fontSize: 10 }}><MapPin size={13} /> بيانات الاتصال والعنوان متاحة لمهامك المسندة فقط.</div>
    </div>
  )
}

export default DriverPage