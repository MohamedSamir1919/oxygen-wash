import { useState } from 'react'
import { ArrowUpLeft, Check, Clock3, PackageCheck, Shirt, Star, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrder } from '../context/useOrder.js'
import { EmptyState, OrderRow, PageHeading, SectionHeading } from '../components/Shared.jsx'
import { formatOrderDate, getOrderStatusLabel } from '../data/orders.js'

const steps = [
  { title: 'تم تأكيد الطلب', note: 'وصلنا طلبك وهنجهّز استلامه', icon: Check },
  { title: 'المندوب في الطريق', note: 'هنستلم القطع من باب البيت', icon: Truck },
  { title: 'في المغسلة', note: 'تم استلام القطع ومراجعتها', icon: Shirt },
  { title: 'جاري الغسيل والمكواة', note: 'كل قطعة بتتعامل بعناية', icon: SparkleIcon },
  { title: 'خرج للتسليم', note: 'مندوبنا راجعلك بالطلب', icon: PackageCheck },
  { title: 'تم التسليم', note: 'نتمنى لك تجربة سعيدة', icon: Check },
]

function SparkleIcon() { return <Clock3 size={14} /> }

function OrdersPage() {
  const { orders, latestOrder, loading, error } = useOrder()
  const [rating, setRating] = useState(0)
  const trackedOrder = latestOrder || orders.find((order) => order.status !== 'delivered') || orders[0]

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="كل طلباتك في مكان واحد" title="طلباتي" subtitle="تتبع طلبك الحالي وارجع لطلباتك السابقة." action={<Link to="/catalog" className="primary-button">طلب جديد <ArrowUpLeft size={15} /></Link>} />
      {error && <p role="alert" style={{ marginBottom: 12, color: '#a13d32', fontSize: 12 }}>{error}</p>}
      {loading && orders.length === 0 && <section className="panel" style={{ padding: 24, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل طلباتك...</section>}
      {orders.length === 0 ? <EmptyState title="مفيش طلبات لسه" text="أول طلب ليك هيظهر هنا وتقدر تتابع كل تفاصيله." to="/catalog" action="ابدأ طلبك" /> : <>
        {trackedOrder && <section className="panel" style={{ padding: 20, marginBottom: 25 }}>
          <SectionHeading title="تتبع الطلب" note={`طلب رقم ${trackedOrder.id} · ${trackedOrder.date}`} action={<span className={`status-pill${trackedOrder.status === 'delivered' ? '' : ' warning'}`}>{trackedOrder.status}</span>} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_.9fr]">
            <div className="timeline">{steps.map((step, index) => { const Icon = step.icon; const done = index < trackedOrder.step; const current = index === trackedOrder.step; return <div className={`timeline-step${done ? ' done' : current ? ' current' : ''}`} key={step.title}><span className="timeline-dot">{done ? <Check size={13} /> : <Icon size={13} />}</span><div><strong>{step.title}</strong><p>{step.note}</p>{trackedOrder.statusHistory?.[index] && <p>{formatOrderDate(trackedOrder.statusHistory[index].changedAt)}</p>}</div></div> })}</div>
            <div style={{ display: 'grid', alignContent: 'start', gap: 12 }}><div style={{ borderRadius: 9, background: '#f3f7f3', padding: 15 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock3 size={16} color="#16765c" /><strong style={{ fontSize: 11 }}>موعد التسليم المتوقع</strong></div><p style={{ marginTop: 9, fontSize: 12 }}>{formatOrderDate(trackedOrder.expectedDeliveryAt)}</p><p className="section-note">حالة الطلب: {getOrderStatusLabel(trackedOrder.status)}</p>{trackedOrder.pickedUpAt && <p className="section-note">تم الاستلام: {formatOrderDate(trackedOrder.pickedUpAt)}</p>}{trackedOrder.deliveredAt && <p className="section-note">تم التسليم: {formatOrderDate(trackedOrder.deliveredAt)}</p>}</div>{trackedOrder.assignedDriver && <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 11 }}><span className="avatar" style={{ width: 32, height: 32 }}>{(trackedOrder.assignedDriver.displayName || trackedOrder.assignedDriver.username).slice(0, 1)}</span><span><strong>مندوبك: {trackedOrder.assignedDriver.displayName || trackedOrder.assignedDriver.username}</strong><span className="order-muted" style={{ display: 'block' }}>تم تسجيل المندوب على الطلب</span></span><a href={`tel:${trackedOrder.assignedDriver.phone}`} className="icon-button" style={{ marginRight: 'auto', width: 34, height: 34 }} aria-label="اتصل بالمندوب"><Truck size={15} /></a></div>}{trackedOrder.customer && <div className="section-note">العنوان: {trackedOrder.customer.address} · {trackedOrder.customer.phone}</div>}</div>
          </div>
        </section>}
        <section>
          <SectionHeading title="سجل الطلبات" note={`${orders.length} طلبات`} />
          <div className="panel" style={{ padding: '0 17px' }}>{orders.map((order) => <OrderRow key={order.id} order={order} />)}</div>
        </section>
        <section className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15, marginTop: 20, padding: 17 }}><div><strong style={{ fontSize: 12 }}>إزاي كانت تجربتك الأخيرة؟</strong><p className="section-note">رأيك بيساعدنا نخدمك أحسن</p></div><div style={{ display: 'flex', gap: 3 }} aria-label="تقييم التجربة">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setRating(star)} aria-label={`تقييم ${star} من 5`} style={{ border: 0, background: 'transparent', color: star <= rating ? '#e6a63b' : '#ccd3ce', padding: 3 }}><Star size={18} fill={star <= rating ? 'currentColor' : 'none'} /></button>)}</div></section>
      </>}
    </div>
  )
}

export default OrdersPage