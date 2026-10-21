import { ArrowUpLeft, Clock3, Droplets, PackageCheck, Shirt, Sparkles, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrder } from '../context/useOrder.js'
import { OrderRow, PageHeading, SectionHeading } from '../components/Shared.jsx'

function DashboardPage() {
  const { orders } = useOrder()
  const activeOrder = orders.find((order) => order.step < 4)

  return (
    <div className="content fade-in">
      <PageHeading eyebrow="الأربعاء، ٢١ أكتوبر ٢٠٢٦" title="صباح الخير" subtitle="جاهزين نهتم بملابسك؟ اختار اللي محتاجه وسيب الباقي علينا." action={<Link to="/catalog" className="secondary-button"><PackageCheck size={16} /> طلباتي السابقة</Link>} />
      <section className="home-hero">
        <div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> عناية تليق بيومك</div><h2 className="hero-title">ملابسك علينا،<br />ووقتك ليك.</h2><p className="hero-description">مندوبنا يستلم من باب البيت ويرجّع كل قطعة جاهزة.</p><Link to="/catalog" className="hero-cta">اطلب استلام من البيت <ArrowUpLeft size={15} /></Link></div>
        <div className="hero-art"><Shirt size={156} strokeWidth={.8} /></div>
      </section>

      <section style={{ marginTop: 30 }}>
        <SectionHeading title="ابدأ بسرعة" note="اختار الخدمة المناسبة لاحتياجك" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/catalog" className="quick-service"><span className="service-icon"><Droplets size={21} /></span><span><strong>غسيل ومكواة</strong><span>من ١٨ ج.م للقطعة</span></span></Link>
          <Link to="/catalog" className="quick-service"><span className="service-icon" style={{ background: '#fff1e9', color: '#bf664d' }}><Wind size={21} /></span><span><strong>مكواة فقط</strong><span>ترتيب مثالي لملابسك</span></span></Link>
          <Link to="/catalog" className="quick-service"><span className="service-icon" style={{ background: '#edf0f8', color: '#626eaa' }}><Sparkles size={20} /></span><span><strong>دراي كلين</strong><span>للقطع الحساسة والمميزة</span></span></Link>
          <Link to="/catalog" className="quick-service"><span className="service-icon" style={{ background: '#fff4df', color: '#aa7b24' }}><Clock3 size={20} /></span><span><strong>خدمة مستعجلة</strong><span>توصيل خلال ٤–٦ ساعات</span></span></Link>
        </div>
      </section>

      <section style={{ marginTop: 29 }}>
        <SectionHeading title="عروض الأسبوع" note="وفّر أكتر مع Oxygen" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="offer-card"><div className="offer-top"><span>عرض لفترة محدودة</span><Sparkles size={15} /></div><strong>خصم ٢٠٪ على أول طلب</strong><p>استخدم كود <bdi>WELCOME20</bdi> عند إتمام الطلب</p></div>
          <div className="offer-card mint"><div className="offer-top"><span>باقة البيت</span><PackageCheck size={15} /></div><strong>٣ قطع مفروشات بسعر قطعتين</strong><p>لأن البيت النضيف يبدأ من التفاصيل</p></div>
        </div>
      </section>

      {activeOrder && <section style={{ marginTop: 29 }}>
        <SectionHeading title="طلبك الحالي" note="هنفضل متابعين معاك خطوة بخطوة" action={<Link to="/orders" className="secondary-button" style={{ minHeight: 34, paddingInline: 11 }}>تتبع الطلب <ArrowUpLeft size={14} /></Link>} />
        <div className="panel" style={{ padding: '0 17px' }}><OrderRow order={activeOrder} /></div>
      </section>}
    </div>
  )
}

export default DashboardPage