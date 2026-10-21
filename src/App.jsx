import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AppShell from './components/AppShell.jsx'
import RequireRole from './components/RequireRole.jsx'
import StaffShell from './components/StaffShell.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import StaffLoginPage from './pages/StaffLoginPage.jsx'
import StaffSignupPage from './pages/StaffSignupPage.jsx'
import { HashRouter } from 'react-router-dom';
function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <OrderProvider>
          <Routes>
            <Route path="/staff/login" element={<StaffLoginPage />} />
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>
            <Route element={<RequireRole allowedRoles={['admin', 'driver']} />}>
              <Route element={<StaffShell />}>
                <Route element={<RequireRole allowedRoles={['admin']} />}>
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="admin/staff/new" element={<StaffSignupPage />} />
                </Route>
                <Route element={<RequireRole allowedRoles={['driver']} />}>
                  <Route path="driver" element={<DriverPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OrderProvider>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
