import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, UserPlus } from 'lucide-react'
import { PageHeading } from '../components/Shared.jsx'
import { useAuth } from '../context/useAuth.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StaffSignupPage() {
  const { token } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('driver')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password, role, displayName, phone }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'تعذر إنشاء الحساب')

      setSuccess(`تم إنشاء حساب ${result.user.username} بنجاح`)
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setRole('driver')
      setDisplayName('')
      setPhone('')
    } catch (signupError) {
      setError(signupError.message || 'تعذر الاتصال بالخادم')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="content fade-in" dir="rtl">
      <PageHeading
        eyebrow="إدارة الفريق"
        title="إضافة حساب موظف"
        subtitle="أنشئ حسابًا جديدًا للوصول إلى مساحة العمل المناسبة."
        action={<Link to="/admin" className="secondary-button"><ArrowRight size={15} /> العودة للإدارة</Link>}
      />
      <section className="panel staff-signup-panel">
        <form className="staff-login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="staff-username">اسم المستخدم</label>
            <input id="staff-username" autoComplete="off" minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]+" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <span className="staff-field-hint">من 3 إلى 32 حرفًا أو رقمًا، بدون مسافات.</span>
          </div>
          <div className="form-field">
            <label htmlFor="staff-role">الصلاحية</label>
            <select id="staff-role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="driver">مندوب</option>
              <option value="admin">مدير</option>
            </select>
          </div>
          {role === 'driver' && <>
            <div className="form-field">
              <label htmlFor="staff-display-name">اسم المندوب</label>
              <input id="staff-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="staff-phone">رقم الهاتف</label>
              <input id="staff-phone" type="tel" pattern="[0-9+ ]{10,15}" value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
          </>}
          <div className="form-field">
            <label htmlFor="staff-password">كلمة المرور</label>
            <input id="staff-password" type="password" autoComplete="new-password" minLength={12} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required />
            <span className="staff-field-hint">12 حرفًا على الأقل.</span>
          </div>
          <div className="form-field">
            <label htmlFor="staff-confirm-password">تأكيد كلمة المرور</label>
            <input id="staff-confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          {error && <p className="staff-login-error" role="alert">{error}</p>}
          {success && <p className="staff-signup-success" role="status">{success}</p>}
          <button className="primary-button staff-login-submit" type="submit" disabled={submitting}>
            <UserPlus size={16} /> {submitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default StaffSignupPage