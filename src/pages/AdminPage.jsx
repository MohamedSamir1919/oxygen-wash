import { useState } from 'react'
import { BarChart3, Check, ChevronDown, CircleDollarSign, PackageCheck, Plus, Shirt, Truck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeading, SectionHeading, StatCard, StatusPill } from '../components/Shared.jsx'
import { getOrderStatusLabel } from '../data/orders.js'
import { useOrder } from '../context/useOrder.js'

function AdminPage() {
  const { orders, drivers, loading, error, assignOrder, updateOrderStatus, catalogItems, catalogServices, catalogLoading, catalogError, createCatalogRecord, updateCatalogRecord, updateItemServicePrice, getItemServicePrice } = useOrder()
  const [itemForm, setItemForm] = useState({ name: '', category: '', price: '' })
  const [serviceForm, setServiceForm] = useState({ name: '', detail: '', extra: '0', applyTo: 'item' })
  const [itemDrafts, setItemDrafts] = useState({})
  const [serviceDrafts, setServiceDrafts] = useState({})
  const [pairPriceDrafts, setPairPriceDrafts] = useState({})
  const [priceServiceId, setPriceServiceId] = useState('')
  const [catalogMessage, setCatalogMessage] = useState('')
  const [catalogBusy, setCatalogBusy] = useState(false)
  const [offerEnabled, setOfferEnabled] = useState(true)
  const [actionError, setActionError] = useState('')
  const currentOrders = orders.filter((order) => order.status !== 'delivered')
  const today = new Date().toDateString()
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - 6 + index)
    const value = orders.filter((order) => new Date(order.createdAt).toDateString() === date.toDateString()).length
    return { day: date.toLocaleDateString('ar-EG', { weekday: 'short' }), value }
  })
  const weeklyTotal = weeklyActivity.reduce((sum, day) => sum + day.value, 0)
  const mostOrderedItems = orders.flatMap((order) => order.lineItems).reduce((totals, item) => ({ ...totals, [item.name]: (totals[item.name] || 0) + (Number(item.quantity) || 0) }), {})
  const popularItems = Object.entries(mostOrderedItems).sort((first, second) => second[1] - first[1]).slice(0, 4)
  const itemServices = catalogServices.filter((service) => service.applyTo === 'item')
  const selectedPriceService = itemServices.find((service) => service._id === priceServiceId) || itemServices[0]

  async function handleAssignment(orderId, driverId, phase) {
    if (!driverId) return
    setActionError('')
    try {
      await assignOrder(orderId, driverId, phase)
    } catch (assignmentError) {
      setActionError(assignmentError.message || 'تعذر إسناد الطلب')
    }
  }

  async function handleStatusChange(orderId, status) {
    setActionError('')
    try {
      await updateOrderStatus(orderId, status)
    } catch (statusError) {
      setActionError(statusError.message || 'تعذر تحديث حالة الطلب')
    }
  }

  async function createItem(event) {
    event.preventDefault()
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await createCatalogRecord('item', { ...itemForm, price: Number(itemForm.price) })
      setItemForm({ name: '', category: '', price: '' })
      setCatalogMessage('تمت إضافة القطعة')
    } catch (createError) {
      setCatalogMessage(createError.message || 'تعذرت إضافة القطعة')
    } finally {
      setCatalogBusy(false)
    }
  }

  async function createService(event) {
    event.preventDefault()
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await createCatalogRecord('service', { ...serviceForm, extra: Number(serviceForm.extra) })
      setServiceForm({ name: '', detail: '', extra: '0', applyTo: 'item' })
      setCatalogMessage('تمت إضافة الخدمة')
    } catch (createError) {
      setCatalogMessage(createError.message || 'تعذرت إضافة الخدمة')
    } finally {
      setCatalogBusy(false)
    }
  }

  async function saveItem(item) {
    const draft = itemDrafts[item._id] || item
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await updateCatalogRecord('item', item._id, { name: draft.name, category: draft.category, price: Number(draft.price) })
      setItemDrafts((current) => { const next = { ...current }; delete next[item._id]; return next })
      setCatalogMessage('تم حفظ القطعة')
    } catch (saveError) {
      setCatalogMessage(saveError.message || 'تعذر حفظ القطعة')
    } finally {
      setCatalogBusy(false)
    }
  }

  async function saveService(service) {
    const draft = serviceDrafts[service._id] || service
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await updateCatalogRecord('service', service._id, { name: draft.name, detail: draft.detail, extra: Number(draft.extra), applyTo: draft.applyTo })
      setServiceDrafts((current) => { const next = { ...current }; delete next[service._id]; return next })
      setCatalogMessage('تم حفظ الخدمة')
    } catch (saveError) {
      setCatalogMessage(saveError.message || 'تعذر حفظ الخدمة')
    } finally {
      setCatalogBusy(false)
    }
  }

  async function savePairPrice(item) {
    if (!selectedPriceService) return
    const key = `${item._id}:${selectedPriceService._id}`
    const price = Number(pairPriceDrafts[key] ?? getItemServicePrice(item._id, selectedPriceService._id))
    if (!Number.isFinite(price) || price < 0) {
      setCatalogMessage('أدخل سعرًا صحيحًا للتركيبة')
      return
    }
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await updateItemServicePrice(item._id, selectedPriceService._id, price)
      setPairPriceDrafts((current) => { const next = { ...current }; delete next[key]; return next })
      setCatalogMessage(`تم حفظ سعر ${item.name} لخدمة ${selectedPriceService.name}`)
    } catch (priceError) {
      setCatalogMessage(priceError.message || 'تعذر حفظ سعر التركيبة')
    } finally {
      setCatalogBusy(false)
    }
  }

  async function toggleCatalogRecord(kind, record) {
    setCatalogBusy(true)
    setCatalogMessage('')
    try {
      await updateCatalogRecord(kind, record._id, { active: !record.active })
      setCatalogMessage(record.active ? 'تم إخفاء السجل من الكتالوج' : 'تم تفعيل السجل')
    } catch (toggleError) {
      setCatalogMessage(toggleError.message || 'تعذر تحديث الحالة')
    } finally {
      setCatalogBusy(false)
    }
  }

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="مساحة العمليات" title="صباح الخير، فريق Oxygen" subtitle="نظرة سريعة على شغل اليوم وحركة الطلبات." action={<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><Link className="secondary-button" to="/admin/staff/new"><UserPlus size={15} /> إضافة موظف</Link><button className="secondary-button" onClick={() => window.print()}><BarChart3 size={15} /> تصدير التقرير</button></div>} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="طلبات اليوم" value={todayOrders.length.toLocaleString('ar-EG')} foot={<><PackageCheck size={13} /> {currentOrders.length.toLocaleString('ar-EG')} طلب نشط</>} icon={PackageCheck} />
        <StatCard label="إيراد اليوم" value={`${todayRevenue.toLocaleString('ar-EG')} ج.م`} foot={<><CircleDollarSign size={13} /> من الطلبات المسجلة اليوم</>} icon={CircleDollarSign} />
        <StatCard label="المندوبون النشطون" value={drivers.length.toLocaleString('ar-EG')} foot={<><Truck size={13} /> حسابات مندوبين متاحة</>} icon={Truck} />
        <StatCard label="إجمالي الطلبات" value={orders.length.toLocaleString('ar-EG')} foot={<><BarChart3 size={13} /> محفوظة في قاعدة البيانات</>} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_.75fr]" style={{ marginTop: 20 }}>
        <section className="panel" style={{ padding: 19 }}>
          <SectionHeading title="حركة الطلبات" note="الطلبات خلال الأسبوع الحالي" action={<button className="secondary-button" style={{ minHeight: 34 }}>هذا الأسبوع <ChevronDown size={14} /></button>} />
          <div style={{ display: 'flex', height: 175, alignItems: 'end', justifyContent: 'space-around', gap: 12, padding: '10px 5px 0', borderBottom: '1px solid var(--line)' }}>
            {weeklyActivity.map((bar) => <div key={bar.day} style={{ display: 'grid', height: '100%', flex: 1, alignContent: 'end', justifyItems: 'center', gap: 8 }}><div title={`${bar.value} طلب`} style={{ width: 'min(34px, 75%)', height: `${Math.max(bar.value ? 18 : 0, (bar.value / Math.max(...weeklyActivity.map((day) => day.value), 1)) * 100)}%`, minHeight: bar.value ? 18 : 0, borderRadius: '5px 5px 0 0', background: '#16765c', transition: 'height .3s' }} /><span style={{ paddingBottom: 7, color: 'var(--muted)', fontSize: 10 }}>{bar.day}</span></div>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, color: 'var(--muted)', fontSize: 10 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#16765c' }} /> {weeklyTotal.toLocaleString('ar-EG')} طلب هذا الأسبوع</div>
        </section>
        <section className="panel" style={{ padding: 19 }}>
          <SectionHeading title="الأكثر طلبًا" note="أعلى قطع خلال الشهر" />
          {popularItems.map(([name, count]) => <div key={name} style={{ marginTop: 17 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}><strong>{name}</strong><span style={{ color: 'var(--muted)' }}>{count.toLocaleString('ar-EG')} قطعة</span></div><div style={{ height: 5, marginTop: 7, borderRadius: 8, background: '#eef2ef' }}><div style={{ width: `${(count / (popularItems[0]?.[1] || 1)) * 100}%`, height: '100%', borderRadius: 8, background: '#76b395' }} /></div></div>)}
          {popularItems.length === 0 && <p className="section-note">ستظهر المنتجات الأكثر طلبًا بعد تسجيل الطلبات.</p>}
        </section>
      </div>

      <section style={{ marginTop: 25 }}>
        <SectionHeading title="الطلبات النشطة" note="تابع الإسناد والحالة المسجلة" action={<span className="status-pill warning">{currentOrders.length} طلبات تحتاج متابعة</span>} />
        {error && <p role="alert" style={{ marginBottom: 10, color: '#a13d32', fontSize: 12 }}>{error}</p>}
        {actionError && <p role="alert" style={{ marginBottom: 10, color: '#a13d32', fontSize: 12 }}>{actionError}</p>}
        <div className="panel table-wrap"><table className="data-table"><thead><tr><th>رقم الطلب</th><th>العميل / القطع</th><th>الموعد</th><th>الحالة</th><th>مندوب الاستلام</th><th>مندوب التسليم</th></tr></thead><tbody>
          {currentOrders.map((order) => <tr key={order._id}>
            <td style={{ fontWeight: 700 }}>{order.id}</td>
            <td>{order.customerName}<div className="order-muted">{order.customer?.phone} · {order.items}</div></td>
            <td>{order.pickupWindow}<div className="order-muted">التسليم المتوقع: {order.expectedDeliveryAt ? new Date(order.expectedDeliveryAt).toLocaleDateString('ar-EG') : 'غير محدد'}</div></td>
            <td><StatusPill tone="warning">{getOrderStatusLabel(order.status)}</StatusPill>{order.status === 'processing' && <button className="secondary-button" style={{ minHeight: 30, marginTop: 6, paddingInline: 8 }} disabled={!order.deliveryDriver} onClick={() => handleStatusChange(order._id, 'ready_for_delivery')}>جاهز للتسليم</button>}</td>
            <td>{['confirmed', 'assigned'].includes(order.status) 
            ? <select aria-label={`اختيار مندوب الاستلام للطلب ${order.id}`} 
            value={order.pickupDriver?._id || order.assignedDriver?._id || ''} 
            onChange={(event) => handleAssignment(order._id, event.target.value, 'pickup')}
             disabled={drivers.length === 0} 
             style={{ border: '1px solid var(--line)', 
             borderRadius: 6,
              background: '#fff', padding: '7px 8px', 
              color: order.pickupDriver || order.assignedDriver ? 'var(--green)' 
              : 'var(--muted)', fontSize: 10 }}>
                <option value="">اختار مندوب الاستلام</option>
                {drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.displayName || driver.username}</option>)}</select> : <span>{order.pickupDriver?.displayName || order.pickupDriver?.username || order.assignedDriver?.displayName || order.assignedDriver?.username || 'غير محدد'}</span>}</td>
            <td>
              <select aria-label={`اختيار مندوب التسليم للطلب ${order.id}`}
               value={order.deliveryDriver?._id || ''} 
               onChange={(event) => handleAssignment(order._id, event.target.value, 'delivery')}
                disabled={drivers.length === 0}
                 style={{ border: '1px solid var(--line)',
                  borderRadius: 6, background: '#fff',
                   padding: '7px 8px', color: order.deliveryDriver ? 'var(--green)' 
                   : 'var(--muted)', fontSize: 10 }}>
              
              <option
               value="">{drivers.length ? 'اختار مندوب التسليم' : 'لا يوجد مندوبون نشطون'}
               </option>{drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.displayName || driver.username}</option>)}</select></td>
          </tr>)}
          {loading && <tr><td colSpan="6" style={{ padding: 25, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل الطلبات...</td></tr>}
          {!loading && currentOrders.length === 0 && <tr><td colSpan="6" style={{ padding: 25, color: 'var(--muted)', textAlign: 'center' }}>لا توجد طلبات نشطة حاليًا</td></tr>}
        </tbody></table></div>
      </section>

      <section style={{ marginTop: 25 }}>
        <SectionHeading title="القطع والأسعار" note="تعديل الأسعار المنشورة وإدارة القطع المحفوظة في قاعدة البيانات" action={<span className="status-pill">{catalogItems.filter((item) => item.active).length.toLocaleString('ar-EG')} قطعة نشطة</span>} />
        <form className="panel grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1fr_140px_auto]" onSubmit={createItem}>
          <div className="form-field"><label htmlFor="new-item-name">اسم القطعة</label><input id="new-item-name" value={itemForm.name} onChange={(event) => setItemForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={80} /></div>
          <div className="form-field"><label htmlFor="new-item-category">القسم</label><input id="new-item-category" value={itemForm.category} onChange={(event) => setItemForm((current) => ({ ...current, category: event.target.value }))} required minLength={2} maxLength={60} /></div>
          <div className="form-field"><label htmlFor="new-item-price">السعر (ج.م)</label><input id="new-item-price" type="number" min="0" step="0.01" value={itemForm.price} onChange={(event) => setItemForm((current) => ({ ...current, price: event.target.value }))} required /></div>
          <button type="submit" className="primary-button self-end" disabled={catalogBusy}><Plus size={15} /> إضافة قطعة</button>
        </form>
        <div className="panel table-wrap" style={{ marginTop: 10 }}><table className="data-table"><thead><tr><th>القطعة</th><th>القسم</th><th>السعر (ج.م)</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>
          {catalogItems.map((item) => { const draft = itemDrafts[item._id] || item; return <tr key={item._id}><td><input aria-label={`اسم القطعة ${item.name}`} value={draft.name} onChange={(event) => setItemDrafts((current) => ({ ...current, [item._id]: { ...draft, name: event.target.value } }))} /></td><td><input aria-label={`قسم القطعة ${item.name}`} value={draft.category} onChange={(event) => setItemDrafts((current) => ({ ...current, [item._id]: { ...draft, category: event.target.value } }))} /></td><td><input aria-label={`سعر القطعة ${item.name}`} type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setItemDrafts((current) => ({ ...current, [item._id]: { ...draft, price: event.target.value } }))} /></td><td><StatusPill tone={item.active ? 'success' : 'gray'}>{item.active ? 'نشطة' : 'مخفية'}</StatusPill></td><td><div style={{ display: 'flex', gap: 6 }}><button type="button" className="secondary-button" style={{ minHeight: 32, paddingInline: 9 }} disabled={catalogBusy} onClick={() => saveItem(item)}>حفظ</button><button type="button" className="secondary-button" style={{ minHeight: 32, paddingInline: 9 }} disabled={catalogBusy} onClick={() => toggleCatalogRecord('item', item)}>{item.active ? 'إخفاء' : 'تفعيل'}</button></div></td></tr> })}
          {catalogLoading && <tr><td colSpan="5" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل القطع...</td></tr>}
          {!catalogLoading && catalogItems.length === 0 && <tr><td colSpan="5" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>لا توجد قطع مسجلة بعد</td></tr>}
        </tbody></table></div>
      </section>

      <section style={{ marginTop: 25 }}>
        <SectionHeading title="الخدمات" note="السعر النهائي يتحدد لكل تركيبة قطعة وخدمة على حدة" action={<span className="status-pill">{catalogServices.filter((service) => service.active).length.toLocaleString('ar-EG')} خدمة نشطة</span>} />
        <form className="panel grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_1.4fr_140px_160px_auto]" onSubmit={createService}>
          <div className="form-field"><label htmlFor="new-service-name">اسم الخدمة</label><input id="new-service-name" value={serviceForm.name} onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={80} /></div>
          <div className="form-field"><label htmlFor="new-service-detail">الوصف</label><input id="new-service-detail" value={serviceForm.detail} onChange={(event) => setServiceForm((current) => ({ ...current, detail: event.target.value }))} maxLength={240} /></div>
          <div className="form-field"><label htmlFor="new-service-extra">قيمة ابتدائية (ج.م)</label><input id="new-service-extra" type="number" step="0.01" value={serviceForm.extra} onChange={(event) => setServiceForm((current) => ({ ...current, extra: event.target.value }))} required /></div>
          <div className="form-field"><label htmlFor="new-service-apply-to">تطبيق الخدمة</label><select id="new-service-apply-to" value={serviceForm.applyTo} onChange={(event) => setServiceForm((current) => ({ ...current, applyTo: event.target.value }))}><option value="item">على كل قطعة</option><option value="order">على الطلب</option></select></div>
          <button type="submit" className="primary-button self-end" disabled={catalogBusy}><Plus size={15} /> إضافة خدمة</button>
        </form>
        <div className="panel table-wrap" style={{ marginTop: 10 }}><table className="data-table"><thead><tr><th>الخدمة</th><th>الوصف</th><th>القيمة الابتدائية (ج.م)</th><th>التطبيق</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>
          {catalogServices.map((service) => { const draft = serviceDrafts[service._id] || service; return <tr key={service._id}><td><input aria-label={`اسم الخدمة ${service.name}`} value={draft.name} onChange={(event) => setServiceDrafts((current) => ({ ...current, [service._id]: { ...draft, name: event.target.value } }))} /></td><td><input aria-label={`وصف الخدمة ${service.name}`} value={draft.detail} onChange={(event) => setServiceDrafts((current) => ({ ...current, [service._id]: { ...draft, detail: event.target.value } }))} /></td><td><input aria-label={`سعر الخدمة ${service.name}`} type="number" step="0.01" value={draft.extra} onChange={(event) => setServiceDrafts((current) => ({ ...current, [service._id]: { ...draft, extra: event.target.value } }))} /></td><td><select aria-label={`نوع تطبيق الخدمة ${service.name}`} value={draft.applyTo} onChange={(event) => setServiceDrafts((current) => ({ ...current, [service._id]: { ...draft, applyTo: event.target.value } }))}><option value="item">على كل قطعة</option><option value="order">على الطلب</option></select></td><td><StatusPill tone={service.active ? 'success' : 'gray'}>{service.active ? 'نشطة' : 'مخفية'}</StatusPill></td><td><div style={{ display: 'flex', gap: 6 }}><button type="button" className="secondary-button" style={{ minHeight: 32, paddingInline: 9 }} disabled={catalogBusy} onClick={() => saveService(service)}>حفظ</button><button type="button" className="secondary-button" style={{ minHeight: 32, paddingInline: 9 }} disabled={catalogBusy} onClick={() => toggleCatalogRecord('service', service)}>{service.active ? 'إخفاء' : 'تفعيل'}</button></div></td></tr> })}
          {catalogLoading && <tr><td colSpan="6" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل الخدمات...</td></tr>}
          {!catalogLoading && catalogServices.length === 0 && <tr><td colSpan="6" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>لا توجد خدمات مسجلة بعد</td></tr>}
        </tbody></table></div>
      </section>
      <section style={{ marginTop: 25 }}>
        <SectionHeading title="سعر كل قطعة حسب الخدمة" note="السعر هنا هو سعر القطعة النهائي للخدمة المختارة" />
        <div className="form-field" style={{ maxWidth: 360, marginBottom: 12 }}>
          <label htmlFor="pair-price-service">الخدمة</label>
          <select id="pair-price-service" value={selectedPriceService?._id || ''} onChange={(event) => setPriceServiceId(event.target.value)} disabled={itemServices.length === 0}>
            {itemServices.length === 0 && <option value="">لا توجد خدمات للقطع</option>}
            {itemServices.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
          </select>
        </div>
        <div className="panel table-wrap"><table className="data-table"><thead><tr><th>القطعة</th><th>القسم</th><th>الخدمة</th><th>السعر النهائي (ج.م)</th><th>إجراء</th></tr></thead><tbody>
          {catalogItems.map((item) => {
            const service = selectedPriceService
            const key = service ? `${item._id}:${service._id}` : ''
            const price = service ? pairPriceDrafts[key] ?? getItemServicePrice(item._id, service._id) ?? '' : ''
            return <tr key={item._id}>
              <td>{item.name}</td><td>{item.category}</td><td>{service?.name || '—'}</td>
              <td><input aria-label={`سعر ${item.name} مع ${service?.name || 'الخدمة'}`} type="number" min="0" step="0.01" value={price} disabled={!service} onChange={(event) => setPairPriceDrafts((current) => ({ ...current, [key]: event.target.value }))} /></td>
              <td><button type="button" className="secondary-button" style={{ minHeight: 32, paddingInline: 9 }} disabled={catalogBusy || !service} onClick={() => savePairPrice(item)}>حفظ السعر</button></td>
            </tr>
          })}
          {catalogLoading && <tr><td colSpan="5" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>جارٍ تحميل الأسعار...</td></tr>}
          {!catalogLoading && catalogItems.length === 0 && <tr><td colSpan="5" style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>أضف قطعًا لتحديد أسعارها حسب الخدمة</td></tr>}
        </tbody></table></div>
      </section>
      {(catalogError || catalogMessage) && <p role={catalogError ? 'alert' : 'status'} style={{ marginTop: 12, color: catalogError ? '#a13d32' : 'var(--green)', fontSize: 11 }}>{catalogError || catalogMessage}</p>}

      <section className="panel" style={{ marginTop: 25, padding: 19 }}>
        <SectionHeading title="العروض الموسمية" note="تحكم في ظهور العرض" action={<button className="secondary-button" style={{ minHeight: 34 }} onClick={() => setOfferEnabled((value) => !value)}>{offerEnabled ? 'إيقاف العرض' : 'تفعيل العرض'}</button>} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, borderRadius: 9, background: offerEnabled ? '#eaf4ef' : '#f3f4f3', padding: 14 }}><span className="service-icon"><Shirt size={18} /></span><span><strong style={{ display: 'block', fontSize: 11 }}>خصم ٢٠٪ على أول طلب</strong><span className="order-muted">{offerEnabled ? 'نشط · ينتهي ٣١ أكتوبر' : 'متوقف مؤقتًا'}</span></span><span className={`status-pill${offerEnabled ? '' : ' gray'}`} style={{ marginRight: 'auto' }}>{offerEnabled ? <><Check size={12} /> نشط</> : 'متوقف'}</span></div>
      </section>
    </div>
  )
}

export default AdminPage