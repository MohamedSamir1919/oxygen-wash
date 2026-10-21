import { useState } from 'react'
import { ArrowUpLeft, CalendarDays, MapPin, Minus, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrder } from '../context/useOrder.js'
import { EmptyState, PageHeading } from '../components/Shared.jsx'

function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, cartCount, subtotal, extras, total, changeQuantity, getCartLinePrice, orderServices, selectedOrderServiceIds, setOrderService, placeOrder, latestOrder } = useOrder()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (cart.length === 0) return
    const details = Object.fromEntries(new FormData(event.currentTarget).entries())
    setError('')
    setSubmitting(true)
    try {
      await placeOrder(details)
      navigate('/orders')
    } catch (orderError) {
      setError(orderError.message || 'تعذر تسجيل الطلب، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return <div className="content fade-in">
    <PageHeading eyebrow="سلتك" title="إتمام الطلب" subtitle="راجع تفاصيل طلبك وحدد وقت الاستلام." />
    <EmptyState title={latestOrder ? 'طلبك اتسجل بنجاح' : 'لسه ما ضفتش قطع'} text={latestOrder ? `رقم طلبك ${latestOrder.id}، تقدر تتابع حالته من صفحة طلباتي.` : 'اختار القطع والخدمة المناسبة، وإحنا هنتولى الباقي.'} to={latestOrder ? '/orders' : '/catalog'} action={latestOrder ? 'تابع طلبك' : 'اختار القطع'} />
  </div>

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="خطوة أخيرة" title="راجع طلبك" subtitle="حدد العنوان والموعد المناسبين للاستلام." />
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_.8fr]">
        <div style={{ display: 'grid', alignContent: 'start', gap: 16 }}>
          <section className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 17 }}><span className="service-icon" style={{ width: 34, height: 34 }}><MapPin size={17} /></span><div><h2 className="section-title">عنوان الاستلام والتسليم</h2><p className="section-note">المندوب هيستلم ويسلّم على نفس العنوان</p></div></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="form-field sm:col-span-2"><label htmlFor="name">اسم العميل</label><input id="name" name="name" autoComplete="name" required /></div>
              <div className="form-field sm:col-span-2"><label htmlFor="address">العنوان بالتفصيل</label><input id="address" name="address" placeholder="المنطقة، الشارع، رقم العمارة والشقة" required /></div>
              <div className="form-field"><label htmlFor="phone">رقم الموبايل</label><input id="phone" name="phone" type="tel" placeholder="01xxxxxxxxx" pattern="[0-9+ ]{10,15}" required /></div>
              <div className="form-field"><label htmlFor="landmark">علامة مميزة (اختياري)</label><input id="landmark" name="landmark" placeholder="بجوار..." /></div>
            </div>
            <button type="button" className="secondary-button" style={{ minHeight: 35, marginTop: 13 }} onClick={() => setError('أدخل عنوانك بالتفصيل، وسيتم تأكيد الموقع مع المندوب عند الاتصال.')}><MapPin size={14} /> تحديد الموقع على الخريطة</button>
            {error && <p role="status" style={{ marginTop: 8, color: '#a96524', fontSize: 10 }}>{error}</p>}
          </section>

          <section className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 17 }}><span className="service-icon" style={{ width: 34, height: 34, background: '#fff1e9', color: '#bf664d' }}><CalendarDays size={17} /></span><div><h2 className="section-title">مواعيد الاستلام والتسليم</h2><p className="section-note">اختار نافذة زمنية مناسبة ليك</p></div></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="form-field"><label htmlFor="pickup">موعد الاستلام</label><select id="pickup" name="pickup" required defaultValue=""><option value="" disabled>اختار اليوم والوقت</option><option value="اليوم · ٤ م – ٧ م">اليوم · ٤ م – ٧ م</option><option value="غدًا · ١٠ ص – ١ م">غدًا · ١٠ ص – ١ م</option><option value="غدًا · ٤ م – ٧ م">غدًا · ٤ م – ٧ م</option></select></div>
              <div className="form-field"><label htmlFor="delivery">موعد التسليم المتوقع</label><select id="delivery" name="delivery" required defaultValue=""><option value="" disabled>اختار الموعد</option><option value="48">بعد ٤٨ ساعة</option><option value="72">بعد ٧٢ ساعة</option><option value="6">خلال ٤–٦ ساعات · مستعجل</option></select></div>
            </div>
          </section>

          <section className="panel" style={{ padding: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 15 }}>إضافات الطلب</h2>
            {orderServices.map((service, index) => <label key={service._id} className={`service-choice${selectedOrderServiceIds.includes(service._id) ? ' selected' : ''}`} style={{ marginBottom: index < orderServices.length - 1 ? 9 : 0 }}><input type="checkbox" checked={selectedOrderServiceIds.includes(service._id)} onChange={(event) => setOrderService(service._id, event.target.checked)} /><span><strong>{service.name} {service.extra > 0 ? `+${service.extra} ج.م` : service.extra < 0 ? `−${Math.abs(service.extra)} ج.م` : ''}</strong><span>{service.detail}</span></span><Sparkles size={16} color="#16765c" style={{ marginRight: 'auto' }} /></label>)}
            {orderServices.length === 0 && <p className="section-note">لا توجد إضافات متاحة لهذا الطلب.</p>}
          </section>
        </div>

        <aside style={{ display: 'grid', alignContent: 'start', gap: 16 }}>
          <section className="panel" style={{ padding: 20 }}>
            <h2 className="section-title">تفاصيل القطع <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({cartCount})</span></h2>
            <div style={{ marginTop: 12 }}>{cart.map((item) => <div key={item.lineId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid #f0f2ef', padding: '12px 0' }}><div><strong style={{ fontSize: 11 }}>{item.name}</strong><div className="order-muted">{item.service} · {getCartLinePrice(item)} ج.م للقطعة</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><button type="button" className="add-item" onClick={() => changeQuantity(item.lineId, -1)} aria-label="تقليل الكمية">{item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}</button><span style={{ minWidth: 15, textAlign: 'center', fontSize: 11 }}>{item.quantity}</span><button type="button" className="add-item" onClick={() => changeQuantity(item.lineId, 1)} aria-label="زيادة الكمية"><Plus size={13} /></button></div></div>)}</div>
            <Link to="/catalog" className="secondary-button" style={{ minHeight: 35, width: '100%' }}><Plus size={14} /> أضف قطع تانية</Link>
            <div style={{ display: 'grid', gap: 9, marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 15, fontSize: 11 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>قيمة القطع</span><span>{subtotal} ج.م</span></div>{extras > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>الإضافات</span><span>{extras} ج.م</span></div>}<div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 12, fontSize: 14, fontWeight: 700 }}><span>الإجمالي</span><span>{total} ج.م</span></div></div>
          </section>
          <section className="panel" style={{ padding: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 13 }}>طريقة الدفع</h2>
            <div className="form-field"><label htmlFor="payment">اختار طريقة الدفع</label><select id="payment" name="payment" defaultValue="الدفع كاش عند الاستلام"><option>الدفع كاش عند الاستلام</option><option>فودافون كاش</option><option>بطاقة بنكية عند الاستلام</option></select></div>
            {error && <p role="alert" style={{ marginTop: 10, color: '#a13d32', fontSize: 11 }}>{error}</p>}
            <button type="submit" className="primary-button" disabled={submitting} style={{ width: '100%', marginTop: 15 }}>{submitting ? 'جارٍ تسجيل الطلب...' : `تأكيد الطلب · ${total} ج.م`} <ArrowUpLeft size={15} /></button>
            <p style={{ marginTop: 10, color: 'var(--muted)', fontSize: 9, textAlign: 'center' }}>مش هتدفع أي حاجة دلوقتي</p>
          </section>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutPage