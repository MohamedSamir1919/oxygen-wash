import { useState } from 'react'
import { ArrowUpLeft, Plus, Shirt, Sparkles, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrder } from '../context/useOrder.js'
import { PageHeading } from '../components/Shared.jsx'

function CatalogPage() {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [serviceId, setServiceId] = useState('')
  const { addItem, cartCount, total, catalogItems, catalogServices, catalogLoading, catalogError, getItemServicePrice } = useOrder()
  const categories = [...new Set(catalogItems.map((item) => item.category))]
  const category = categories[categoryIndex] || categories[0]
  const itemServices = catalogServices.filter((service) => service.applyTo === 'item')
  const selectedService = itemServices.find((service) => service._id === serviceId) || itemServices[0]

  if (catalogLoading) return <div className="content"><PageHeading eyebrow="كتالوج Oxygen" title="اختار اللي محتاجه" subtitle="جارٍ تحميل القطع والخدمات..." /></div>
  if (catalogError) return <div className="content"><PageHeading eyebrow="كتالوج Oxygen" title="الكتالوج غير متاح" subtitle={catalogError} /></div>

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="كتالوج Oxygen" title="اختار اللي محتاجه" subtitle="أسعار واضحة، وعناية مختلفة لكل قطعة." />
      <section className="panel" style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><div><h2 className="section-title">نوع الخدمة</h2><p className="section-note">اختيارك هيتطبق على القطع اللي هتضيفها</p></div><Sparkles size={17} color="#16765c" /></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" style={{ marginTop: 15 }}>
          {itemServices.map((service) => <label key={service._id} className={`service-choice${service._id === (selectedService?._id || serviceId) ? ' selected' : ''}`}><input type="radio" name="service" checked={service._id === (selectedService?._id || serviceId)} onChange={() => setServiceId(service._id)} /><span><strong>{service.name}</strong><span>{service.detail}</span></span></label>)}
          {itemServices.length === 0 && <p className="section-note">لا توجد خدمات للقطع متاحة حاليًا.</p>}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
          <div style={{ display: 'flex' }}>{categories.map((entry, index) => <button key={entry} className={`category-tab${index === categoryIndex ? ' active' : ''}`} onClick={() => setCategoryIndex(index)}>{entry}</button>)}</div>
          <span className="section-note" style={{ paddingBottom: 12, whiteSpace: 'nowrap' }}>الأسعار للقطعة الواحدة</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" style={{ marginTop: 15 }}>
          {catalogItems.filter((item) => item.category === category).map((item) => <article className="item-card" key={item._id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}><span className="item-symbol"><Shirt size={19} /></span><button className="add-item" aria-label={`أضف ${item.name}`} disabled={!selectedService} onClick={() => addItem(item, selectedService)}><Plus size={17} /></button></div>
            <div><h3>{item.name}</h3><div className="item-price">{selectedService ? `${getItemServicePrice(item._id, selectedService._id) ?? '—'} ج.م` : '—'} {selectedService && <span style={{ color: '#a6b0aa' }}>· {selectedService.name}</span>}</div></div>
          </article>)}
          {catalogItems.length === 0 && <p className="section-note">لا توجد قطع متاحة حاليًا.</p>}
        </div>
      </section>

      {cartCount > 0 && <div className="cart-bar"><div><strong style={{ fontSize: 12 }}>{cartCount} قطعة في السلة</strong><div className="section-note">الإجمالي الحالي: {total} ج.م</div></div><Link to="/checkout" className="primary-button">كمّل الطلب <ArrowUpLeft size={15} /></Link></div>}
      {cartCount === 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 18, color: '#89958e', fontSize: 10 }}><Wind size={14} /> الاستلام والتوصيل مجانًا للطلبات فوق ١٥٠ ج.م</div>}
    </div>
  )
}

export default CatalogPage