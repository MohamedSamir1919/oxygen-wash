import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'

function StaffLoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <main className="auth-loading" aria-busy="true" />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const staff = await login(username, password)
      navigate(staff.role === 'admin' ? '/admin' : '/driver', { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'اسم المستخدم أو كلمة المرور غير صحيحة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="staff-login-page" dir="rtl">
      <section className="staff-login-panel fade-in">
        <a href="/" className="staff-login-back">العودة للعميل</a>
        <div className="staff-login-brand"><span className="brand-mark"><Sparkles size={20} /></span><span className="brand-name">oxygen</span></div>
        <div className="eyebrow">مساحة فريق العمل</div>
        <h1 className="staff-login-title">تسجيل دخول الموظفين</h1>
        <p className="staff-login-copy">استخدم بيانات حسابك للدخول إلى لوحة العمل.</p>
        <form onSubmit={handleSubmit} className="staff-login-form">
          <div className="form-field"><label htmlFor="username">اسم المستخدم</label><input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></div>
          <div className="form-field"><label htmlFor="password">كلمة المرور</label><input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {error && <p className="staff-login-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button staff-login-submit" disabled={submitting}><KeyRound size={16} /> {submitting ? 'جارٍ التحقق...' : 'تسجيل الدخول'} <ArrowLeft size={15} /></button>
        </form>
      </section>
      <div className="staff-login-aside"><span>OXYGEN / OPERATIONS</span><strong>كل طلب يبدأ<br />بفريق يعرف طريقه.</strong><p>إدارة ومتابعة عمليات Oxygen في مكان واحد.</p></div>
    </main>
  )
}

export default StaffLoginPage